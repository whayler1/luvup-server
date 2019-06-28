import isUUID from 'is-uuid';
import isString from 'lodash/isString';
import { graphql } from 'graphql';

import schema from '../schema';
import sequelize from '../sequelize';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import trackCreateRelationshipWithInvite from '../../services/analytics/trackCreateRelationshipWithInvite';
import sendCreateRelationshipWithInviteEmails from '../../emails/sendCreateRelationshipWithInviteEmails';

jest.mock('../../services/analytics/trackCreateRelationshipWithInvite');
jest.mock('../../emails/sendCreateRelationshipWithInviteEmails');

describe('createRelationshipWithInvite', () => {
  let user;
  let res;

  beforeAll(async () => {
    const loggedInUser = await createLoggedInUser({
      isInRelationship: false,
    });
    user = loggedInUser.user;
    const rootValue = loggedInUser.rootValue;

    const query = `mutation {
      createRelationshipWithInvite(
        recipientEmail: "recipient@email.com"
        recipientFirstName: "Erlich"
        recipientLastName: "Bachman"
      ) {
        loverRequest {
          id isAccepted isSenderCanceled isRecipientCanceled createdAt
          recipient { id }
          sender { id email isPlaceholder username firstName lastName }
        }
        relationship {
          id createdAt updatedAt endDate
          lovers { id email isPlaceholder username firstName lastName }
        }
        userInvite {
          id relationshipId senderId loverRequestId userRequestId recipientEmail recipientFirstName recipientLastName
        }
      }
    }`;
    res = await graphql(schema, query, rootValue, sequelize);
  });

  it('returns a loverRequest', () => {
    const {
      id,
      isAccepted,
      isSenderCanceled,
      isRecipientCanceled,
      createdAt,
      recipient,
    } = res.data.createRelationshipWithInvite.loverRequest;

    expect(isUUID.v1(id)).toBe(true);
    expect(isAccepted).toBe(false);
    expect(isSenderCanceled).toBe(false);
    expect(isRecipientCanceled).toBe(false);
    expect(isString(createdAt)).toBe(true);
    expect(recipient).toBeNull();
  });

  it('returns a relationship', () => {
    const {
      id,
      createdAt,
      updatedAt,
      endDate,
    } = res.data.createRelationshipWithInvite.relationship;
    expect(isUUID.v1(id)).toBe(true);
    expect(isString(createdAt)).toBe(true);
    expect(isString(updatedAt)).toBe(true);
    expect(endDate).toBeNull();
  });

  it('returns placeholderLover in relationship', () => {
    const {
      id,
      email,
      isPlaceholder,
      username,
      firstName,
      lastName,
    } = res.data.createRelationshipWithInvite.relationship.lovers[0];
    expect(isUUID.v1(id)).toBe(true);
    expect(email).toBe('recipient@email.com');
    expect(isPlaceholder).toBe(true);
    expect(isString(username)).toBe(true);
    expect(firstName).toBe('Erlich');
    expect(lastName).toBe('Bachman');
  });

  it('returns a userInvite', () => {
    const {
      loverRequest,
      relationship,
      userInvite: {
        id,
        relationshipId,
        senderId,
        loverRequestId,
        userRequestId,
        recipientEmail,
        recipientFirstName,
        recipientLastName,
      },
    } = res.data.createRelationshipWithInvite;
    expect(isUUID.v1(id)).toBe(true);
    expect(isUUID.v1(relationshipId)).toBe(true);
    expect(relationshipId).toBe(relationship.id);
    expect(isUUID.v1(senderId)).toBe(true);
    expect(senderId).toBe(user.id);
    expect(isUUID.v1(loverRequestId)).toBe(true);
    expect(loverRequestId).toBe(loverRequest.id);
    expect(userRequestId).toBeNull();
    expect(recipientEmail).toBe('recipient@email.com');
    expect(recipientFirstName).toBe('Erlich');
    expect(recipientLastName).toBe('Bachman');
  });

  it('calls analytics', () => {
    const {
      loverRequest,
      relationship,
      userInvite,
    } = res.data.createRelationshipWithInvite;
    const [userId, options] = trackCreateRelationshipWithInvite.mock.calls[0];
    expect(userId).toBe(user.id);
    expect(options).toMatchObject({
      loverRequestId: loverRequest.id,
      relationshipId: relationship.id,
      userInviteId: userInvite.id,
      recipientEmail: 'recipient@email.com',
      recipientFirstName: 'Erlich',
      recipientLastName: 'Bachman',
    });
  });

  it('sends emails', () => {
    const {
      loverRequest,
      relationship,
      userInvite,
    } = res.data.createRelationshipWithInvite;
    const {
      sender,
      recipientEmail,
      recipientFirstName,
      recipientLastName,
      userInviteId,
    } = sendCreateRelationshipWithInviteEmails.mock.calls[0][0];
    const loverRequestSender = loverRequest.sender;
    expect(sender.dataValues).toMatchObject({
      id: loverRequestSender.id,
      email: loverRequestSender.email,
      emailConfirmed: true,
      isPlaceholder: false,
      username: loverRequestSender.username,
      firstName: loverRequestSender.firstName,
      lastName: loverRequestSender.lastName,
      RelationshipId: relationship.id,
    });
    expect(recipientEmail).toBe('recipient@email.com');
    expect(recipientFirstName).toBe('Erlich');
    expect(recipientLastName).toBe('Bachman');
    expect(userInviteId).toBe(userInvite.id);
  });
});
