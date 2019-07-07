import DataType from 'sequelize';

import Model from '../sequelize';

const UserInvite = Model.define('UserInvite', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },

  relationshipId: {
    type: DataType.UUID,
  },

  senderId: {
    type: DataType.UUID,
    allowNull: false,
  },

  loverRequestId: {
    type: DataType.UUID,
  },

  userRequestId: {
    type: DataType.UUID,
  },

  recipientEmail: {
    type: DataType.STRING(255),
    validate: { isEmail: true },
    allowNull: false,
  },

  recipientFirstName: {
    type: DataType.STRING(50),
    min: 2,
  },

  recipientLastName: {
    type: DataType.STRING(50),
    min: 2,
  },
});

UserInvite.findWithSenderAndRelationship = async function findWithSenderAndRelationship(
  relationshipId,
  senderId,
) {
  const userInvite = await UserInvite.findOne({
    where: { relationshipId, senderId },
  });

  if (!userInvite) {
    throw new Error('User invite does not exist');
  }

  return userInvite;
};

export default UserInvite;
