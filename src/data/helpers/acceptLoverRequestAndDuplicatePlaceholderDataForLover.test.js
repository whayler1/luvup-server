import times from 'lodash/times';
import acceptLoverRequestAndDuplicatePlaceholderDataForLover from './acceptLoverRequestAndDuplicatePlaceholderDataForLover';
import { User, LoverRequest } from '../models';

describe('acceptLoverRequestAndDuplicatePlaceholderDataForLover', () => {
  let sender;
  let recipient;
  let loverRequest;
  let relationship;
  let subject;

  beforeAll(async () => {
    [sender, recipient] = await Promise.all(
      times(2, () => User.createSkipUserRequest()),
    );
    const loverRequestRes = await LoverRequest.createAndAddRelationshipAndPlaceholderLover(
      sender.id,
      recipient.id,
    );
    loverRequest = loverRequestRes.loverRequest;
    relationship = loverRequestRes.relationship;
    subject = await acceptLoverRequestAndDuplicatePlaceholderDataForLover(
      recipient.id,
      loverRequest.id,
    );
  });

  it('returns user with relationship id', async () => {
    expect(subject.user).toEqual(
      expect.objectContaining({
        id: recipient.id,
        email: recipient.email,
        isPlaceholder: false,
        username: recipient.username,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        fullName: recipient.fullName,
        RelationshipId: relationship.id,
      }),
    );
  });
});
