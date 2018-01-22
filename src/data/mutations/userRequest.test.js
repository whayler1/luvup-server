import { graphql } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import uuidv1 from 'uuid/v1';

import schema from '../schema';
import models, { User, UserRequest } from '../models';
import config from '../../config';

beforeAll(() => {
  config.disableEmail = 'true';
});

afterAll(() => {
  config.disableEmail = false;
});

it('should return an error if a user with the requested email already exists', async () => {
  const uuid = uuidv1();
  const email = `justin+${uuid}@luvup.io`;

  const userRequest = await UserRequest.create({
    email,
    code: '123456',
  });
  const user = await userRequest.createUser({
    username: uuid,
    firstName: 'Jason',
    lastName: 'Wents',
    fullName: 'Jason Wents',
    email,
    emailConfirmed: true,
    password: 'Testing123',
  });

  const query = `mutation {
    userRequest(email: "${email}") {
      email error
    }
  }`;

  const result = await graphql(schema, query, {}, {});
  const { data } = result;

  expect(data.userRequest).toMatchObject({
    email: null,
    error: 'used',
  });
});

it('should allow user to request access', async () => {
  const uuid = uuidv1();
  const email = `justin+${uuid}@luvup.io`;

  const query = `mutation {
    userRequest(email: "${email}") {
      email error
    }
  }`;

  const result = await graphql(schema, query, {}, {});
  const { data } = result;

  expect(data.userRequest).toMatchObject({
    email,
    error: null,
  });
});
