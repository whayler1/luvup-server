import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import jwt from 'jsonwebtoken';
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
    const verify = await jwt.verify(
      request.cookies.id_token,
      config.auth.jwt.secret,
    );

    console.log('\n\nverify', verify);

    if (verify) {
      const userRes = await User.findAndCountAll({
        limit,
        offset,
        where: {
          email: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('email')),
            'LIKE',
            `%${search}%`,
          ),
        },
      });
      console.log('\n\nuserRes', userRes);
      return userRes;
    }
    return {};
  },
};

export default users;
