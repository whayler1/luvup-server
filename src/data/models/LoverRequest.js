import DataType from 'sequelize';

import Model from '../sequelize';
import Relationship from './Relationship';
import User from './User';
import { generateScore } from '../helpers/relationshipScore';

const LoverRequest = Model.define('LoverRequest', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  relationshipId: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
  },

  isAccepted: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  isSenderCanceled: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  isRecipientCanceled: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },
});

LoverRequest.findPendingRequestBySenderId = async function findPendingRequestBySenderId(
  senderId,
) {
  return this.findOne({
    where: {
      UserId: senderId,
      isAccepted: false,
      isSenderCanceled: false,
      isRecipientCanceled: false,
    },
  });
};

LoverRequest.cancelBySenderId = async function cancelBySenderId(senderId) {
  const loverRequest = await this.findPendingRequestBySenderId(senderId);
  if (!loverRequest) {
    throw new Error(`No pending lover request for user: ${senderId}`);
  }
  return loverRequest.cancelBySender();
};

LoverRequest.findById = async function findById(id) {
  return this.findOne({ where: { id } });
};

const relateRelationshipAndUsers = (relationship, users) =>
  users.reduce(
    (accumulator, user) => [
      ...accumulator,
      user.update({ RelationshipId: relationship.id }),
      relationship.addLover(user),
    ],
    [],
  );

LoverRequest.createAndAddRelationshipAndPlaceholderLover = async function createAndAddRelationshipAndPlaceholderLover(
  senderId,
  recipientId,
) {
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
    this.create({
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

LoverRequest.prototype.cancelBySender = async function cancelBySender() {
  await this.update({ isSenderCanceled: true });
  const relationship = await Relationship.findOne({
    where: { id: this.relationshipId },
  });
  const lovers = await relationship.getLover();
  const updateRemoveLoverRelationshipId = lovers.map(lover =>
    lover.update({
      RelationshipId: null,
    }),
  );
  const updateRelationshipEndDate = relationship.update({
    endDate: new Date(),
  });
  await Promise.all([
    updateRelationshipEndDate,
    ...updateRemoveLoverRelationshipId,
  ]);
  return {
    loverRequest: this,
    relationship,
    lovers,
  };
};

export default LoverRequest;
