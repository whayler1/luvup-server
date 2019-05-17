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
    });

    it('returns a loverRequest', async () => {
      const { loverRequest, relationship } = subject;
      console.log('loverRequest', loverRequest);

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
  });
});
