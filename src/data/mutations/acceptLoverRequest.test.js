import isUUID from 'is-uuid';
import isString from 'lodash/isString';
import { graphql } from 'graphql';
import schema from '../schema';
import sequelize from '../sequelize';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { User, LoverRequest } from '../models';
import { trackAcceptLoverRequest } from '../../services/analytics';
import { acceptLoverRequest as sendPushNotification } from '../../services/pushNotifications';
import { sendAcceptLoverRequestEmails } from '../../emails';

jest.mock('../../services/analytics');
jest.mock('../../services/pushNotifications');
jest.mock('../../emails');

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
    await Promise.all([sender.reload(), recipient.reload()]);
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

  it('calls trackAcceptLoverRequest', () => {
    expect(trackAcceptLoverRequest.mock.calls[0]).toMatchObject([
      recipient.id,
      sender.id,
      loverRequest.id,
    ]);
  });

  it('calls sendPushNotification', () => {
    expect(sendPushNotification.mock.calls[0][0].dataValues).toMatchObject(
      sender.dataValues,
    );
    expect(sendPushNotification.mock.calls[0][1].dataValues).toMatchObject(
      recipient.dataValues,
    );
  });

  it('calls sendAcceptLoverRequestEmails', () => {
    expect(
      sendAcceptLoverRequestEmails.mock.calls[0][0].dataValues,
    ).toMatchObject(sender.dataValues);
    expect(
      sendAcceptLoverRequestEmails.mock.calls[0][1].dataValues,
    ).toMatchObject(recipient.dataValues);
  });
});
