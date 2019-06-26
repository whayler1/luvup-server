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

export default UserInvite;
