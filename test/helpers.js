import jwt from 'jsonwebtoken';
import _ from 'lodash';
import uuidv1 from 'uuid/v1';

import { UserRequest, Relationship } from '../src/data/models';
import config from '../src/config';

export const createUser = async (
  username,
  firstName = 'foo',
  lastName = 'bar',
) => {
  const uuid = uuidv1();
  const email = `justin+${uuid}@luvup.io`;

  const userRequest = await UserRequest.create({ email, code: '12345' });
  const user = await userRequest.createUser({
    email,
    emailConfirmed: true,
    username: username || uuid,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    password: 'Testing123',
  });

  return user;
};

export const deleteUser = async user => {
  const userRequest = await UserRequest.findOne({ where: { id: user.id } });

  await userRequest.destroy();
  await user.destroy();
};

export const loginUser = user =>
  jwt.sign(
    _.pick(user.dataValues, 'id', 'username', 'email', 'firstName', 'lastName'),
    config.auth.jwt.secret,
    { expiresIn: 60 },
  );

export const createRelationship = async (requestor, recipient) => {
  const relationship = await Relationship.create();
  await relationship.addLover(requestor);
  await relationship.addLover(recipient);
  return relationship;
};

export default {
  createUser,
  deleteUser,
  loginUser,
  createRelationship,
};
