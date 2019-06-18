import isString from 'lodash/isString';
import uuidv1 from 'uuid/v1';
import {
  User,
  UserEvent,
  Coin,
  Jalapeno,
  LoveNote,
  QuizItem,
  LoverRequest,
  Relationship,
} from '../models';
import { LoverRequestNotFoundError } from '../errors';
import { generateScore } from '../helpers/relationshipScore';

const removePlaceholderLover = async relationship => {
  const placeholderLover = await relationship.getPlaceholderLover();
  if (placeholderLover) {
    await placeholderLover.update({ RelationshipId: null });
  }
  return placeholderLover;
};

const sendables = [
  {
    model: UserEvent,
    userId: 'userId',
    disableKey: 'isViewed',
  },
  {
    model: Coin,
    userId: 'recipientId',
    disableKey: 'isUsed',
  },
  {
    model: Jalapeno,
    userId: 'recipientId',
    disableKey: 'isExpired',
  },
  {
    model: QuizItem,
    userId: 'recipientId',
    disableKey: 'isArchived',
  },
  {
    model: LoveNote,
    userId: 'recipientId',
    disableKey: 'isRead',
  },
];

const addSendablesToUser = async (
  sendable,
  placeholderLover,
  user,
  relationship,
) => {
  const { model, userId, disableKey } = sendable;
  const placeholderLoverEvents = await model.getWithUserAndRelationship(
    placeholderLover.id,
    relationship.id,
  );
  if (placeholderLoverEvents.length > 0) {
    const newSendableArgs = placeholderLoverEvents.map(data => ({
      ...data.dataValues,
      id: uuidv1(),
      [userId]: user.id,
    }));

    await model.bulkCreate(newSendableArgs);
    await model.update(
      {
        [disableKey]: true,
        relationshipId: null,
      },
      {
        where: {
          [userId]: placeholderLover.id,
          relationshipId: relationship.id,
        },
      },
    );
  }
  return Promise.resolve();
};

const addPlacedholderLoverUserEventsToUser = async (
  placeholderLover,
  user,
  relationship,
) =>
  Promise.all(
    sendables.map(sendable =>
      addSendablesToUser(sendable, placeholderLover, user, relationship),
    ),
  );

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

  await addPlacedholderLoverUserEventsToUser(
    placeholderLover,
    user,
    relationship,
  );
  const [relationshipScore] = await Promise.all([
    generateScore(user),
    generateScore(sender),
  ]);

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
