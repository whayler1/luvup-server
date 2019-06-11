import isUUID from 'is-uuid';
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

  it('returns sender with relationship id', () => {
    expect(subject.sender).toEqual(
      expect.objectContaining({
        id: sender.id,
        email: sender.email,
        isPlaceholder: false,
        username: sender.username,
        firstName: sender.firstName,
        lastName: sender.lastName,
        fullName: sender.fullName,
        RelationshipId: relationship.id,
      }),
    );
  });

  it('returns placeholder lover with no relationship id', () => {
    expect(isUUID.v1(subject.placeholderLover.id)).toBe(true);
    expect(subject.placeholderLover).toEqual(
      expect.objectContaining({
        email: recipient.email,
        isPlaceholder: true,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        fullName: recipient.fullName,
        RelationshipId: null,
      }),
    );
  });

  it('returns lover request', () => {
    expect(isUUID.v1(subject.loverRequest.id)).toBe(true);
    expect(subject.loverRequest).toEqual(
      expect.objectContaining({
        relationshipId: relationship.id,
        isAccepted: true,
        isSenderCanceled: false,
        isRecipientCanceled: false,
        UserId: sender.id,
        recipientId: recipient.id,
      }),
    );
  });

  it('returns relationship', () => {
    console.log(subject.relationship);
    expect(subject.relationship).toEqual(
      expect.objectContaining({
        id: relationship.id,
        endDate: null,
      }),
    );
  });
});
