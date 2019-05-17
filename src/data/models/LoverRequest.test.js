import times from 'lodash/times';

import LoverRequest from './LoverRequest';
import User from './User';

describe('LoverRequest', () => {
  describe('createAndAddRelationshipAndPlaceholderLover', () => {
    let sender;
    let recipient;

    beforeAll(async () => {
      const users = await Promise.all(
        times(2, () => User.createSkipUserRequest()),
      );
      sender = users[0];
      recipient = users[1];
    });

    it('does something', async () => {
      await LoverRequest.createAndAddRelationshipAndPlaceholderLover(
        sender.id,
        recipient.id,
      );
    });
  });
});
