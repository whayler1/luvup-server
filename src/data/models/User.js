import DataType from 'sequelize';
import uuid from 'uuid/v1';

import Model from '../sequelize';
import UserRequest from './UserRequest';

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

    isPlaceholder: {
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

User.createPlaceholderUserFromUser = async function createPlaceholderUserFromUser(
  userId,
) {
  const recipient = this.findByPk(userId);
  const placeholderUserRequest = await UserRequest.create({
    email: recipient.email,
    code: 'placholder',
  });
  const placeholderLoverId = uuid();
  const placeholderLover = await placeholderUserRequest.createUser({
    id: placeholderLoverId,
    email: recipient.email,
    isPlaceholder: true,
    username: placeholderLoverId,
    firstName: recipient.firstName,
    lastName: recipient.lastName,
    fullName: recipient.fullName,
    password: placeholderLoverId,
  });
  return placeholderLover;
};

export default User;
