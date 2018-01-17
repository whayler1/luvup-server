import DataType from 'sequelize';
import Model from '../sequelize';

const UserPasswordReset = Model.define('UserPasswordReset', {
  userId: {
    type: DataType.UUID,
    primaryKey: true,
  },

  resetPassword: {
    type: DataType.STRING(100),
    min: 8,
  },

  isUsed: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },
});

export default UserPasswordReset;
