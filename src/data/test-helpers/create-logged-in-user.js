import _ from 'lodash';
import uuidv1 from 'uuid/v1';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { UserRequest } from '../models';

const createLoggedInUser = async () => {
  const uuid = uuidv1();
  const email = `jwents+${uuid}@gmail.com`;
  const newUserRequest = await UserRequest.create({
    email,
    code: '123456',
  });
  const user = await newUserRequest.createUser({
    username: uuid,
    firstName: 'Jason',
    lastName: 'Wents',
    fullName: 'Jason Wents',
    email,
    emailConfirmed: true,
    password: 'Testing123',
  });

  const token = jwt.sign(
    _.pick(user.dataValues, 'id', 'username', 'email', 'firstName', 'lastName'),
    config.auth.jwt.secret,
    { expiresIn: 60 },
  );

  const rootValue = {
    request: {
      cookies: {
        id_token: token,
      },
    },
  };

  return { user, token, rootValue };
};

export default createLoggedInUser;
