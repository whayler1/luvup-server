import DataType from 'sequelize';

import Model from '../sequelize';
import Relationship from './Relationship';
import User from './User';

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

const relateRelationshipandUsers = (relationship, users) =>
  users.reduce(
    (accumulator, user) => [
      ...accumulator,
      user.setRelationship(relationship),
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
    ...[senderId, recipientId].map(id => User.findByPk(id)),
    User.createPlaceholderUserFromUser(recipientId),
    Relationship.create(),
  ]);
  const [loverRequest] = await Promise.all([
    this.create({
      senderId,
      recipientId,
      relationshipId: relationship.id,
    }),
    ...relateRelationshipandUsers(relationship, [sender, placeholderLover]),
  ]);

  return {
    loverRequest: {
      ...loverRequest.dataValues,
      sender: sender.dataValues,
      recipient: recipient.dataValues,
    },
    relationship: {
      ...relationship.dataValues,
      lovers: [placeholderLover],
    },
  };
};

LoverRequest.prototype.cancelBySender = async function cancelBySender() {
  await this.update({ isSenderCanceled: true });
  const relationship = this.getRelationship();
  const lovers = relationship.getLover();
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
