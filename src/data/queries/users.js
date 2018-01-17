import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import sequelize from '../sequelize';
import UserType from '../types/UserType';
import { Coin, User } from '../models';
import config from '../../config';

const users = {
  type: new GraphQLObjectType({
    name: 'UsersResource',
    fields: {
      rows: { type: new GraphQLList(UserType) },
      count: { type: GraphQLInt },
    },
  }),
  args: {
    search: { type: GraphQLString },
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  resolve: async ({ request }, { search, limit, offset }) => {
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token) {
      return {};
    }

    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const userRes = await User.findAndCountAll({
        limit,
        offset,
        where: {
          $or: [
            {
              username: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('username')),
                'LIKE',
                `%${search}%`,
              ),
            },
            {
              email: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('email')),
                'LIKE',
                `%${search}%`,
              ),
            },
          ],
        },
      });

      return userRes;
    }
    return {};
  },
};

export default users;
