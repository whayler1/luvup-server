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

User.createSkipUserRequest = async function createSkipUserRequest(opts = {}) {
  const { email, username, firstName, lastName } = opts;
  const randomId = uuid();
  const userRequest = await UserRequest.create({
    email: email || `email+${randomId}@mail.com`,
    code: 'placholder',
  });
  return this.create({
    id: userRequest.id,
    email: email || `email+${randomId}@mail.com`,
    isPlaceholder: false,
    username: username || randomId,
    firstName: firstName || 'Jane',
    lastName: lastName || 'Doe',
    fullName: 'Jane Doe',
    password: 'somepassword',
  });
};

User.createPlaceholderUserFromUser = async function createPlaceholderUserFromUser(
  userId,
) {
  const randomId = uuid();
  const user = this.findOne({ where: { id: userId } });
  const userRequest = await UserRequest.create({
    email: `placeholderLover+${randomId}@gmail.com`,
    code: 'placholder',
  });
  return this.create({
    id: userRequest.id,
    email: user.email,
    isPlaceholder: true,
    username: randomId,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    password: randomId,
  });
};

export default User;
