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
import { User } from '../models';
import config from '../../config';

const users = {
  type: new GraphQLObjectType({
    name: 'UsersResource',
    fields: {
      rows: { type: new GraphQLList(UserType) },
      count: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      offset: { type: GraphQLInt },
    },
  }),
  args: {
    search: { type: GraphQLString },
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  resolve: async ({ request }, { search, limit, offset }) => {
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token || !search) {
      return {};
    }
    const searchLowercase = search.toLowerCase();

    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const userRes = await User.findAndCountAll({
        limit,
        offset,
        where: {
          $not: {
            id: verify.id,
            isPlaceholder: true,
          },
          $or: [
            {
              username: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('username')),
                'LIKE',
                `%${searchLowercase}%`,
              ),
            },
            {
              email: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('email')),
                'LIKE',
                `%${searchLowercase}%`,
              ),
            },
            {
              fullName: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('fullName')),
                'LIKE',
                `%${searchLowercase}%`,
              ),
            },
          ],
        },
      });

      return Object.assign({}, userRes, { limit, offset });
    }
    return {};
  },
};

export default users;
