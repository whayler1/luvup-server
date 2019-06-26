import times from 'lodash/times';
import isString from 'lodash/isString';
import isUUID from 'is-uuid';

import { User } from '../models';
import {
  createRelationshipWithLoverRequest,
  createRelationshipWithInvite,
} from './relationshipInitializer';

describe('relationhipInitializer', () => {
  describe('createRelationshipWithLoverRequest', () => {
    let sender;
    let recipient;
    let subject;

    beforeAll(async () => {
      const users = await Promise.all(
        times(2, () => User.createSkipUserRequest()),
      );
      sender = users[0];
      recipient = users[1];
      subject = await createRelationshipWithLoverRequest(
        sender.id,
        recipient.id,
      );
      await sender.reload();
      await recipient.reload();
    });

    it('returns a loverRequest', async () => {
      const { loverRequest, relationship } = subject;

      expect(isString(loverRequest.id)).toBe(true);
      expect(loverRequest.relationshipId).toBe(relationship.id);
      expect(loverRequest.createdAt).toBeInstanceOf(Date);
      expect(loverRequest.updatedAt).toBeInstanceOf(Date);
      expect(loverRequest).toEqual(
        expect.objectContaining({
          isAccepted: false,
          isSenderCanceled: false,
          isRecipientCanceled: false,
        }),
      );
    });

    it('returns sender and recipient in lover request', async () => {
      const {
        loverRequest: {
          sender: loverRequestSender,
          recipient: loverRequestRecipient,
        },
      } = subject;

      expect(loverRequestSender).toEqual(
        expect.objectContaining(sender.dataValues),
      );
      expect(loverRequestRecipient).toEqual(
        expect.objectContaining(recipient.dataValues),
      );
    });

    it('returns a relationhip', () => {
      const { relationship } = subject;
      expect(isString(relationship.id)).toBe(true);
      expect(relationship.createdAt).toBeInstanceOf(Date);
      expect(relationship.updatedAt).toBeInstanceOf(Date);
    });

    it('returns placeholder lover in relationhip', () => {
      const {
        relationship: {
          lovers: [
            {
              emailConfirmed,
              id,
              email,
              isPlaceholder,
              username,
              firstName,
              lastName,
              fullName,
              password,
              updatedAt,
              createdAt,
              RelationshipId,
            },
          ],
        },
      } = subject;
      expect(emailConfirmed).toBe(false);
      expect(isString(id)).toBe(true);
      expect(email).toBe(recipient.email);
      expect(isPlaceholder).toBe(true);
      expect(isString(username)).toBe(true);
      expect(firstName).toBe(recipient.firstName);
      expect(lastName).toBe(recipient.lastName);
      expect(fullName).toBe(recipient.fullName);
      expect(isString(password)).toBe(true);
      expect(updatedAt).toBeInstanceOf(Date);
      expect(createdAt).toBeInstanceOf(Date);
      expect(RelationshipId).toBe(subject.relationship.id);
    });
  });

  describe.only('createRelationshipWithInvite', () => {
    let sender;
    let recipient;
    let subject;

    beforeAll(async () => {
      const users = await Promise.all(
        times(2, () => User.createSkipUserRequest()),
      );
      sender = users[0];
      recipient = users[1];
      subject = await createRelationshipWithInvite(
        sender.id,
        'test@email.com',
        'Bob',
        'Recipient',
      );
      await sender.reload();
      await recipient.reload();
    });

    it('returns a loverRequest', async () => {
      const { loverRequest, relationship } = subject;

      expect(isString(loverRequest.id)).toBe(true);
      expect(loverRequest.relationshipId).toBe(relationship.id);
      expect(loverRequest.createdAt).toBeInstanceOf(Date);
      expect(loverRequest.updatedAt).toBeInstanceOf(Date);
      expect(loverRequest).toEqual(
        expect.objectContaining({
          isAccepted: false,
          isSenderCanceled: false,
          isRecipientCanceled: false,
        }),
      );
    });

    it('returns sender in lover request', async () => {
      const { loverRequest: { sender: loverRequestSender } } = subject;

      expect(loverRequestSender).toEqual(
        expect.objectContaining(sender.dataValues),
      );
    });

    it('returns a relationhip', () => {
      const { relationship } = subject;
      expect(isString(relationship.id)).toBe(true);
      expect(relationship.createdAt).toBeInstanceOf(Date);
      expect(relationship.updatedAt).toBeInstanceOf(Date);
    });

    it('returns placeholder lover in relationhip', () => {
      const {
        relationship: {
          lovers: [
            {
              emailConfirmed,
              id,
              email,
              isPlaceholder,
              username,
              firstName,
              lastName,
              fullName,
              password,
              updatedAt,
              createdAt,
              RelationshipId,
            },
          ],
        },
      } = subject;
      expect(emailConfirmed).toBe(false);
      expect(isString(id)).toBe(true);
      expect(email).toBe('test@email.com');
      expect(isPlaceholder).toBe(true);
      expect(isString(username)).toBe(true);
      expect(firstName).toBe('Bob');
      expect(lastName).toBe('Recipient');
      expect(fullName).toBe('Bob Recipient');
      expect(isString(password)).toBe(true);
      expect(updatedAt).toBeInstanceOf(Date);
      expect(createdAt).toBeInstanceOf(Date);
      expect(RelationshipId).toBe(subject.relationship.id);
    });

    it('returns userInvite', () => {
      const {
        relationship,
        loverRequest,
        userInvite: {
          id,
          senderId,
          relationshipId,
          loverRequestId,
          recipientEmail,
          recipientFirstName,
          recipientLastName,
          updatedAt,
          createdAt,
        },
      } = subject;
      expect(isUUID.v1(id)).toBe(true);
      expect(senderId).toBe(sender.id);
      expect(relationshipId).toBe(relationship.id);
      expect(loverRequestId).toBe(loverRequest.id);
      expect(recipientEmail).toBe('test@email.com');
      expect(recipientFirstName).toBe('Bob');
      expect(recipientLastName).toBe('Recipient');
      expect(updatedAt).toBeInstanceOf(Date);
      expect(createdAt).toBeInstanceOf(Date);
    });
  });
});
