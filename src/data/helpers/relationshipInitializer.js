/* eslint-disable import/prefer-default-export */
import { User, Relationship, LoverRequest } from '../models';
import { generateScore } from './relationshipScore';

const relateRelationshipAndUsers = (relationship, users) =>
  users.reduce(
    (accumulator, user) => [
      ...accumulator,
      user.update({ RelationshipId: relationship.id }),
      relationship.addLover(user),
    ],
    [],
  );

export const createRelationshipWithLoverRequest = async (
  senderId,
  recipientId,
) => {
  const [
    sender,
    recipient,
    placeholderLover,
    relationship,
  ] = await Promise.all([
    ...[senderId, recipientId].map(id => User.findById(id)),
    User.createPlaceholderUserFromUser(recipientId),
    Relationship.create(),
  ]);
  const [loverRequest] = await Promise.all([
    LoverRequest.create({
      UserId: senderId,
      recipientId,
      relationshipId: relationship.id,
    }),
    ...relateRelationshipAndUsers(relationship, [sender, placeholderLover]),
  ]);
  await generateScore(placeholderLover);

  return {
    loverRequest: {
      ...loverRequest.dataValues,
      sender,
      recipient,
    },
    relationship: {
      ...relationship.dataValues,
      lovers: [placeholderLover],
    },
  };
};
