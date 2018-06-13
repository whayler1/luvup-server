import DataType from 'sequelize';
import Model from '../sequelize';

const ExpoPushToken = Model.define('ExpoPushToken', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  token: {
    type: DataType.STRING,
    allowNull: false,
  },

  isValid: {
    type: DataType.BOOLEAN,
    defaultValue: true,
  },
});

export default ExpoPushToken;
