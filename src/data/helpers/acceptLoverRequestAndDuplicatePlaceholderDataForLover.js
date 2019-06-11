import isString from 'lodash/isString';
import { User, LoverRequest, Relationship } from '../models';
import { LoverRequestNotFoundError } from '../errors';
import { generateScore } from '../helpers/relationshipScore';

const removePlaceholderLover = async relationship => {
  const placeholderLover = await relationship.getPlaceholderLover();
  if (placeholderLover) {
    await placeholderLover.update({ RelationshipId: null });
  }
  return placeholderLover;
};

const acceptLoverRequestAndDuplicatePlaceholderDataForLover = async (
  userId,
  loverRequestId,
) => {
  const loverRequest = await LoverRequest.findById(loverRequestId);
  if (!loverRequest) {
    throw LoverRequestNotFoundError;
  }
  if (
    loverRequest.isSenderCanceled ||
    loverRequest.isRecipientCanceled ||
    loverRequest.isAccepted
  ) {
    throw new Error('This lover request is no longer valid');
  }
  const [user, sender, relationship] = await Promise.all([
    User.findById(userId),
    User.findById(loverRequest.UserId),
    Relationship.findById(loverRequest.relationshipId),
  ]);
  if (isString(user.RelationshipId) && user.RelationshipId.length > 0) {
    throw new Error(
      `${user.firstName} ${user.lastName} is already in a relationship`,
    );
  }
  const placeholderLover = await removePlaceholderLover(relationship);
  await loverRequest.update({
    isAccepted: true,
  });
  await Promise.all([
    user.setRelationship(relationship),
    relationship.addLover(user),
  ]);

  const relationshipScore = await generateScore(user);
  await generateScore(sender);

  return {
    user,
    sender,
    placeholderLover,
    loverRequest,
    relationship,
    relationshipScore,
  };
};

export default acceptLoverRequestAndDuplicatePlaceholderDataForLover;
