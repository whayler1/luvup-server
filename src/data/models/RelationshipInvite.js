import DataType from 'sequelize';
import Model from '../sequelize';

const RelationshipInvite = Model.define('RelationshipInvite', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },

  recipientFirstName: {
    type: DataType.STRING(50),
    min: 2,
    allowNull: false,
  },

  recipientLastName: {
    type: DataType.STRING(50),
    min: 2,
    allowNull: false,
  },

  recipientEmail: {
    type: DataType.STRING(255),
    validate: { isEmail: true },
    allowNull: false,
  },

  message: { type: DataType.TEXT },

  isUsed: {
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

export default RelationshipInvite;
