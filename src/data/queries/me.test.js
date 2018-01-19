import { graphql } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import schema from '../schema';
import models, { User, UserRequest } from '../models';
import sequelize from '../sequelize';
import config from '../../config';

beforeAll(async () => {
  await models.sync();
});

it('should be null when user is not logged in', async () => {
  const query = `
    query {
      me {
        id
      }
    }
  `;

  const result = await graphql(schema, query, {}, {});
  const { data } = result;

  expect(data.me).toBe(null);
});

it('should have user data when logged in', async () => {
  const query = `
    query {
      me {
        id username firstName lastName email
        relationship {
          id
        }
      }
    }
  `;

  const email = 'jwents@gmail.com';
  const newUserRequest = await UserRequest.create({
    email,
    code: '123456',
  });
  const user = await newUserRequest.createUser({
    username: 'foo123',
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

  const result = await graphql(schema, query, rootValue, sequelize);

  expect(result.data).toMatchObject({
    me: {
      id: user.id,
      username: 'foo123',
      firstName: 'Jason',
      lastName: 'Wents',
      email,
      relationship: null,
    },
  });
});
