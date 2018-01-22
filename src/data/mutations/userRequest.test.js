import { graphql } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import uuidv1 from 'uuid/v1';

import schema from '../schema';
import models, { User, UserRequest, Relationship } from '../models';
import sequelize from '../sequelize';
import config from '../../config';

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
  console.log('result', result);

  // expect(data.me).toBe(null);
});
