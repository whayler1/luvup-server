import times from 'lodash/times';
import isString from 'lodash/isString';

import LoverRequest from './LoverRequest';
import Relationship from './Relationship';
import User from './User';

describe('LoverRequest', () => {
  describe('cancelBySender', () => {
    let sender;
    let recipient;
    let loverRequest;
    let relationship;

    beforeAll(async () => {
      const users = await Promise.all(
        times(2, () => User.createSkipUserRequest()),
      );
      sender = users[0];
      recipient = users[1];
      const res = await LoverRequest.createAndAddRelationshipAndPlaceholderLover(
        sender.id,
        recipient.id,
      );
      loverRequest = await LoverRequest.findById(res.loverRequest.id);
      relationship = await Relationship.findById(res.relationship.id);
      await sender.reload();
      await recipient.reload();
      await loverRequest.cancelBySender();
      await Promise.all(
        [sender, recipient, loverRequest, relationship].map(model =>
          model.reload(),
        ),
      );
    });

    it('cancels loverRequest', () => {
      expect(isString(loverRequest.relationshipId)).toBe(true);
      expect(loverRequest.isAccepted).toBe(false);
      expect(loverRequest.isSenderCanceled).toBe(true);
      expect(loverRequest.isRecipientCanceled).toBe(false);
    });

    it('ends relationhip', () => {
      expect(relationship.endDate).toBeInstanceOf(Date);
    });

    it('removes relationship from sender', () => {
      expect(sender.RelationshipId).toBeNull();
    });

    it('removes relationship from recipient', () => {
      expect(recipient.RelationshipId).toBeNull();
    });
  });
});
