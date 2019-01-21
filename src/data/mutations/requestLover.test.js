import { graphql } from 'graphql';
import schema from '../schema';
import sequelize from '../sequelize';
import { UserNotLoggedInError } from '../errors';
import { LoverRequest } from '../models';
import createLoggedInUser, {
  createUser,
} from '../test-helpers/create-logged-in-user';
import pushNotifications from '../../services/pushNotifications';
import emailHelper from '../helpers/email';
import analytics from '../../services/analytics';

jest.mock('../../services/pushNotifications');
jest.mock('../helpers/email');
jest.mock('../../services/analytics');

describe('requestLover', () => {
  describe('when user not logged in', () => {
    it('should return UserNotLoggedInError', async () => {
      const query = `mutation {
        requestLover(recipientId: "abc123") { id }
      }`;
      const { errors: [firstError] } = await graphql(
        schema,
        query,
        {},
        sequelize,
      );
      expect(firstError.message).toBe(UserNotLoggedInError.message);
    });
  });

  describe('when user logged in', () => {
    describe('when user with requested id exists', () => {
      let user;
      let user2;
      let requestLover;
      let loverRequest;

      beforeAll(async () => {
        user = await createLoggedInUser({
          isInRelationship: false,
        });
        user2 = await createUser({
          firstName: 'Bob',
          lastName: 'Boyfriend',
          fullName: 'Bob Boyfriend',
        });
        const query = `mutation {
          requestLover(recipientId: "${user2.id}") {
            id, isAccepted, isSenderCanceled, isRecipientCanceled, createdAt,
            sender {
              id, email, username, firstName, lastName
            },
            recipient {
              id, email, username, firstName, lastName
            }
          }
        }`;
        const request = await graphql(schema, query, user.rootValue, sequelize);
        requestLover = request.data.requestLover;
        const loverRequestRes = await LoverRequest.findAll({
          limit: 1,
          order: [['createdAt', 'DESC']],
        });
        loverRequest = loverRequestRes[0];
      });

      afterAll(() => {
        afterEach(() => {
          /* eslint-disable import/no-named-as-default-member */
          pushNotifications.sendPushNotification.mockReset();
          emailHelper.sendEmail.mockReset();
          analytics.track.mockReset();
          /* eslint-enable import/no-named-as-default-member */
        });
      });

      it('should return loverRequest', async () => {
        expect(requestLover).toMatchObject({
          id: loverRequest.id,
          isAccepted: false,
          isSenderCanceled: false,
          isRecipientCanceled: false,
        });

        expect(requestLover.createdAt).toBeTruthy();
      });

      it('should return sender', () => {
        expect(requestLover.sender).toMatchObject({
          id: user.user.id,
          email: user.user.email,
          username: user.user.username,
          firstName: user.user.firstName,
          lastName: user.user.lastName,
        });
      });

      it('should return recipient', () => {
        expect(requestLover.recipient).toMatchObject({
          id: user2.id,
          email: user2.email,
          username: user2.username,
          firstName: user2.firstName,
          lastName: user2.lastName,
        });
      });

      it('should send emails', () => {
        const { calls } = emailHelper.sendEmail.mock;

        expect(calls[0][0].to).toBe(user.user.email);
        expect(calls[0][0].subject).toBe(
          'Luvup lover request sent to Bob Boyfriend',
        );
        expect(calls[0][0].html).toBe(
          "<p>Hi Jason,</p><p>Your 💖lover💖 request has been sent to <b>Bob Boyfriend</b>! We'll let you know when they accept 😉.</p>",
        );
        expect(calls[1][0].to).toBe(user2.email);
        expect(calls[1][0].subject).toBe(
          "You've received a lover request from Jason Wents on Luvup!",
        );
        expect(calls[1][0].html).toBe(
          '<p>Hi Bob,</p><p>You have received a 💖lover💖 request from <b>Jason Wents</b> on Luvup! <b>Log into the Luvup app</b> to accept.</p><p><small>Email <a href="mailto:justin@luvup.io">justin@luvup.io</a> to flag this user.</small></p>',
        );
      });

      it('should send analytics', () => {
        const { calls } = analytics.track.mock;

        expect(calls[0][0].userId).toBe(user.user.id);
        expect(calls[0][0].event).toBe('requestLover');
        expect(calls[0][0].properties).toMatchObject({
          category: 'loverRequest',
          recipientId: user2.id,
          loverRequestId: loverRequest.id,
        });
      });
    });
  });
});
