import { graphql } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import uuid from 'uuid/v1';

import schema from '../schema';
import { UserRequest, Relationship } from '../models';
import sequelize from '../sequelize';
import config from '../../config';
import { modelsSync } from '../test-helpers';

describe('me', () => {
  beforeAll(async () => {
    await modelsSync;
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

    const uuid1 = uuid();
    const email = `jwents+${uuid1}@gmail.com`;
    const newUserRequest = await UserRequest.create({
      email,
      code: '123456',
    });
    const user = await newUserRequest.createUser({
      username: uuid1,
      firstName: 'Jason',
      lastName: 'Wents',
      fullName: 'Jason Wents',
      email,
      emailConfirmed: true,
      password: 'Testing123',
    });

    const token = jwt.sign(
      _.pick(
        user.dataValues,
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
      ),
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
        username: uuid1,
        firstName: 'Jason',
        lastName: 'Wents',
        email,
        relationship: null,
      },
    });
  });

  it('should have user and relationship data when logged in and relationship exists', async () => {
    const query = `
      query {
        me {
          id username firstName lastName email
          relationship {
            id
            lovers {
              id username firstName lastName email
            }
          }
        }
      }
    `;

    const uuid1 = uuid();
    const email = `jwents+${uuid1}@gmail.com`;
    const newUserRequest = await UserRequest.create({
      email,
      code: '123456',
    });
    const user = await newUserRequest.createUser({
      username: uuid1,
      firstName: 'Jason',
      lastName: 'Wents',
      fullName: 'Jason Wents',
      email,
      emailConfirmed: true,
      password: 'Testing123',
    });

    const uuid2 = uuid();
    const email2 = `linda+${uuid2}@gmail.com`;
    const newUserRequest2 = await UserRequest.create({
      email: email2,
      code: '345678',
    });

    const recipient = await newUserRequest2.createUser({
      username: uuid2,
      firstName: 'Linda',
      lastName: 'Stevens',
      fullName: 'Linda Stevens',
      email: email2,
      emailConfirmed: true,
      password: 'Testing123',
    });

    const relationship = await Relationship.create();
    await relationship.addLover(user);
    await relationship.addLover(recipient);

    const token = jwt.sign(
      _.pick(
        user.dataValues,
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
      ),
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
        username: uuid1,
        firstName: 'Jason',
        lastName: 'Wents',
        email,
        relationship: {
          id: relationship.id,
          lovers: [
            {
              id: recipient.id,
              username: uuid2,
              firstName: 'Linda',
              lastName: 'Stevens',
              email: email2,
            },
          ],
        },
      },
    });
  });
});
