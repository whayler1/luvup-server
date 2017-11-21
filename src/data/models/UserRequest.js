import DataType from 'sequelize';
import Model from '../sequelize';

const UserRequest = Model.define('UserRequest', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  email: {
    type: DataType.STRING(255),
    validate: { isEmail: true },
    allowNull: false,
  },

  code: {
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 100000,
      max: 999999,
    },
  },
});

export default UserRequest;
