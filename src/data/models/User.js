import DataType from 'sequelize';
import Model from '../sequelize';

const User = Model.define(
  'User',
  {
    id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV1,
      primaryKey: true,
    },

    email: {
      type: DataType.STRING(255),
      validate: { isEmail: true },
    },

    emailConfirmed: {
      type: DataType.BOOLEAN,
      defaultValue: false,
    },

    username: {
      type: DataType.STRING(20),
      allowNull: false,
      min: 3,
    },

    firstName: {
      type: DataType.STRING(50),
      min: 2,
    },

    lastName: {
      type: DataType.STRING(50),
      min: 2,
    },

    fullName: {
      type: DataType.STRING(100),
    },

    password: {
      type: DataType.STRING(100),
      allowNull: false,
      min: 8,
    },
  },
  {
    indexes: [{ fields: ['email'] }],
  },
);

export default User;
