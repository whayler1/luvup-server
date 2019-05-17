import times from 'lodash/times';
import isString from 'lodash/isString';

import LoverRequest from './LoverRequest';
import User from './User';

describe('LoverRequest', () => {
  describe('createAndAddRelationshipAndPlaceholderLover', () => {
    let sender;
    let recipient;
    let subject;

    beforeAll(async () => {
      const users = await Promise.all(
        times(2, () => User.createSkipUserRequest()),
      );
      sender = users[0];
      recipient = users[1];
      subject = await LoverRequest.createAndAddRelationshipAndPlaceholderLover(
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
    it('returns a relationhip', () => {});
    it('returns lovers in relationhip', () => {});
    it('creates a new relationship', () => {
      // This should actually look up relationhip
    });
    it('creates a placholder lover related to the relationship', () => {
      // This should actually look up relationhip
    });
  });
});
