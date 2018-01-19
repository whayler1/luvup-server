import { graphql } from 'graphql';

import schema from '../schema';
import models, { User, UserRequest } from '../models';
import sequelize from '../sequelize';

xit('should be null when user is not logged in', async () => {
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
      }
    }
  `;

  // const email = 'jwents@gmail.com';
  // const newUserRequest = await UserRequest.create({
  //   email,
  //   code: '123456',
  // });
  // const user = await newUserRequest.createUser({
  //   username: 'foo123',
  //   firstName: 'Jason',
  //   lastName: 'Wents',
  //   fullName: 'Jason Wents',
  //   email,
  //   emailConfirmed: true,
  //   password: 'Testing123',
  // });

  // const context = getContext({ user });
  const rootValue = {
    request: {
      id_token: '123',
    },
  };

  const result = await graphql(schema, query, rootValue, sequelize);

  console.log('result', result.data);
});
