import isUUID from 'is-uuid';
import isString from 'lodash/isString';
import { graphql } from 'graphql';
import schema from '../schema';
import sequelize from '../sequelize';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { User, LoverRequest } from '../models';

// createUser,
// import analytics from '../../services/analytics';
// import { sendPushNotification } from '../../services/pushNotifications';
// import emailHelper from '../helpers/email';

jest.mock('../../services/pushNotifications');
jest.mock('../helpers/email');

describe('acceptLoverRequest', () => {
  let sender;
  let recipient;
  let loverRequest;
  let relationship;
  let subject;

  beforeAll(async () => {
    const loggedInUserRes = await createLoggedInUser({
      isInRelationship: false,
    });
    recipient = loggedInUserRes.user;
    sender = await User.createSkipUserRequest();
    const loverRequestRes = await LoverRequest.createAndAddRelationshipAndPlaceholderLover(
      sender.id,
      recipient.id,
    );
    loverRequest = loverRequestRes.loverRequest;
    relationship = loverRequestRes.relationship;
    const { rootValue } = loggedInUserRes;
    const query = `mutation {
      acceptLoverRequest(
        loverRequestId: "${loverRequest.id}"
      ) {
        loverRequest { id isAccepted isSenderCanceled isRecipientCanceled createdAt }
        relationship { id createdAt updatedAt endDate }
        relationshipScore { id createdAt updatedAt score relationshipId, userId }
      }
    }`;
    subject = await graphql(schema, query, rootValue, sequelize);
  });

  it('returns loverRequest', () => {
    const {
      data: { acceptLoverRequest: { loverRequest: loverRequestRes } },
    } = subject;
    expect(loverRequestRes).toEqual(
      expect.objectContaining({
        id: loverRequest.id,
        isAccepted: true,
        isSenderCanceled: false,
        isRecipientCanceled: false,
      }),
    );
    expect(isString(loverRequestRes.createdAt)).toBe(true);
  });

  it('returns relationship', () => {
    const {
      data: { acceptLoverRequest: { relationship: relationshipRes } },
    } = subject;
    expect(relationshipRes).toEqual(
      expect.objectContaining({
        id: relationship.id,
        endDate: null,
      }),
    );
    expect(isString(relationshipRes.createdAt)).toBe(true);
    expect(isString(relationshipRes.updatedAt)).toBe(true);
  });

  it('returns relationshipScore', () => {
    const {
      data: { acceptLoverRequest: { relationshipScore: relationshipScoreRes } },
    } = subject;
    expect(relationshipScoreRes).toEqual(
      expect.objectContaining({
        score: 0,
        relationshipId: relationship.id,
        userId: recipient.id,
      }),
    );
    expect(isUUID.v1(relationshipScoreRes.id)).toBe(true);
    expect(isString(relationshipScoreRes.createdAt)).toBe(true);
    expect(isString(relationshipScoreRes.updatedAt)).toBe(true);
  });
});

// import _ from 'lodash';
// import { Relationship, RelationshipScore } from '../models';
// import { UserNotLoggedInError, LoverRequestNotFoundError } from '../errors';
//
//
// describe('acceptLoverRequest', () => {
//   describe('when user is logged in', () => {
//     describe('when no lover request with matching id exists', () => {
//       it('should throw LoverRequestNotFoundError error', async () => {
//         const { rootValue } = await createLoggedInUser({
//           isInRelationship: false,
//         });
//         const query = `mutation {
//           acceptLoverRequest(
//             loverRequestId: "abc123"
//           ) {
//             loverRequest { id }
//           }
//         }`;
//         const { errors: [firstError] } = await graphql(
//           schema,
//           query,
//           rootValue,
//           sequelize,
//         );
//
//         expect(firstError.message).toBe(LoverRequestNotFoundError.message);
//       });
//     });
//
//     describe('when lover request exists', () => {
//       const originalAnalyticsTrack = analytics.track;
//       let user;
//       let user2;
//       let request;
//       let user2LoverRequest;
//
//       beforeEach(async () => {
//         analytics.track = jest.fn();
//
//         const loggedInUser = await createLoggedInUser({
//           isInRelationship: false,
//         });
//
//         user = loggedInUser.user;
//
//         user2 = await createUser();
//         user2LoverRequest = await user2.createLoverRequest({
//           recipientId: user.id,
//         });
//
//         const query = `mutation {
//           acceptLoverRequest(
//             loverRequestId: "${user2LoverRequest.id}"
//           ) {
//             loverRequest {
//               id
//               isAccepted
//               isSenderCanceled
//               isRecipientCanceled
//             }
//             relationship {
//               id createdAt updatedAt endDate
//               lovers { id email firstName lastName }
//             }
//           }
//         }`;
//
//         request = await graphql(
//           schema,
//           query,
//           loggedInUser.rootValue,
//           sequelize,
//         );
//       });
//
//       afterEach(() => {
//         /* eslint-disable import/no-named-as-default-member */
//         sendPushNotification.mockReset();
//         emailHelper.sendEmail.mockReset();
//         /* eslint-enable import/no-named-as-default-member */
//       });
//
//       afterAll(() => {
//         analytics.track = originalAnalyticsTrack;
//       });
//
//       it('should return accepted lover request object', async () => {
//         const { data: { acceptLoverRequest: { loverRequest } } } = request;
//
//         expect(loverRequest.id).toBe(user2LoverRequest.id);
//         expect(loverRequest.isAccepted).toBe(true);
//         expect(loverRequest.isSenderCanceled).toBe(false);
//         expect(loverRequest.isRecipientCanceled).toBe(false);
//       });
//
//       it('should return relationship object', async () => {
//         const { data: { acceptLoverRequest: { relationship } } } = request;
//         const [lover] = relationship.lovers;
//
//         expect(_.isString(relationship.id)).toBe(true);
//         expect(_.isString(relationship.createdAt)).toBe(true);
//         expect(_.isString(relationship.updatedAt)).toBe(true);
//         expect(relationship.endDate).toBeNull();
//         expect(_.isString(lover.id)).toBe(true);
//         expect(lover.email).toBe(user2.email);
//         expect(lover.firstName).toBe(user2.firstName);
//         expect(lover.lastName).toBe(user2.lastName);
//       });
//
//       it('should set user and lovers relationship', async () => {
//         await user.reload();
//         await user2.reload();
//         const [relationship] = await Relationship.findAll({
//           limit: 1,
//           order: [['createdAt', 'DESC']],
//         });
//
//         expect(user.RelationshipId).toBe(relationship.id);
//         expect(user2.RelationshipId).toBe(relationship.id);
//       });
//
//       it('should add lover ids to relationship', async () => {
//         const [relationship] = await Relationship.findAll({
//           limit: 1,
//           order: [['createdAt', 'DESC']],
//         });
//
//         const lovers = await relationship.getLover();
//
//         expect(lovers[0].id).toBe(user.id);
//         expect(lovers[1].id).toBe(user2.id);
//         expect(lovers).toHaveLength(2);
//       });
//
//       it('should generate relationship scores', async () => {
//         const [relationship] = await Relationship.findAll({
//           limit: 1,
//           order: [['createdAt', 'DESC']],
//         });
//
//         const [userRelationshipScore] = await RelationshipScore.findAll({
//           limit: 1,
//           where: {
//             userId: user.id,
//           },
//           order: [['createdAt', 'DESC']],
//         });
//         const [loverRelationshipScore] = await RelationshipScore.findAll({
//           limit: 1,
//           where: {
//             userId: user2.id,
//           },
//           order: [['createdAt', 'DESC']],
//         });
//
//         expect(userRelationshipScore.dataValues).toEqual(
//           expect.objectContaining({
//             userId: user.id,
//             relationshipId: relationship.id,
//             score: 0,
//           }),
//         );
//         expect(loverRelationshipScore.dataValues).toEqual(
//           expect.objectContaining({
//             userId: user2.id,
//             relationshipId: relationship.id,
//             score: 0,
//           }),
//         );
//       });
//
//       it('should call analytics track', async () => {
//         const { calls } = analytics.track.mock;
//         const { data: { acceptLoverRequest: { loverRequest } } } = request;
//
//         expect(calls).toHaveLength(1);
//         expect(calls[0][0]).toEqual(
//           expect.objectContaining({
//             userId: user.id,
//             event: 'acceptLoverRequest',
//             properties: expect.objectContaining({
//               category: 'loverRequest',
//               loverRequestId: loverRequest.id,
//               senderId: user2.id,
//             }),
//           }),
//         );
//       });
//
//       it('should send push notification', async () => {
//         /* eslint-disable import/no-named-as-default-member */
//         const { calls } = sendPushNotification.mock;
//         /* eslint-enable import/no-named-as-default-member */
//         expect(calls).toHaveLength(1);
//         expect(calls[0][0]).toBe(user2.id);
//         expect(calls[0][1]).toBe(
//           'Jason Wents has accepted your lover request! 💞',
//         );
//         expect(calls[0][2]).toEqual(
//           expect.objectContaining({
//             type: 'lover-request-accepted',
//           }),
//         );
//       });
//
//       it('should send emails', () => {
//         const { calls } = emailHelper.sendEmail.mock;
//
//         expect(calls[0][0].to).toBe(user2.email);
//         expect(calls[0][0].subject).toBe(
//           'You have been accepted by a new lover!',
//         );
//         expect(calls[0][0].html).toBe(
//           '<p>Hi Jason Wents,</p><p>Congratulations, <b>Jason Wents</b> has accepted your lover request on Luvup!</p>',
//         );
//         expect(calls[1][0].to).toBe(user.email);
//         expect(calls[1][0].subject).toBe('You have accepted a new lover!');
//         expect(calls[1][0].html).toBe(
//           '<p>Hi Jason Wents,</p><p>Congratulations, you have accepted <b>Jason Wents</b> as your new lover on Luvup!</p>',
//         );
//       });
//     });
//   });
//
//   describe('when user is not logged in', () => {
//     it('should throw UserNotLoggedInError', async () => {
//       const query = `mutation {
//         acceptLoverRequest(
//           loverRequestId: "abc123"
//         ) {
//           loverRequest { id }
//         }
//       }`;
//       const { errors: [firstError] } = await graphql(
//         schema,
//         query,
//         {},
//         sequelize,
//       );
//
//       expect(firstError.message).toBe(UserNotLoggedInError.message);
//     });
//   });
// });
