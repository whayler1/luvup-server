import times from 'lodash/times';
import acceptLoverRequestAndDuplicatePlaceholderDataForLover from './acceptLoverRequestAndDuplicatePlaceholderDataForLover';
import { User, LoverRequest } from '../models';

describe('acceptLoverRequestAndDuplicatePlaceholderDataForLover', () => {
  let sender;
  let recipient;
  let loverRequest;

  beforeAll(async () => {
    [sender, recipient] = await Promise.all(
      times(2, () => User.createSkipUserRequest()),
    );
    const loverRequestRes = await LoverRequest.createAndAddRelationshipAndPlaceholderLover(
      sender.id,
      recipient.id,
    );
    loverRequest = loverRequestRes.loverRequest;
  });

  it('does something', async () => {
    const subject = await acceptLoverRequestAndDuplicatePlaceholderDataForLover(
      recipient.id,
      loverRequest.id,
    );
    console.log('subject', subject);
  });
});
