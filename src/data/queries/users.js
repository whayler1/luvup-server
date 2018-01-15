import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import UserType from '../types/UserType';
import { Coin, User } from '../models';

const users = {
  type: new GraphQLObjectType({
    name: 'UsersResource',
    fields: {
      rows: { type: new GraphQLList(UserType) },
      count: { type: GraphQLInt },
    },
    args: {
      search: {},
      limit: { type: GraphQLInt },
      offset: { type: GraphQLInt },
    },
    resolve: async ({ request }, { search, limit, offset }) => ({}),
    // if (!('user' in request) && !('id' in request.user)) {
    //   return false;
    // }
    //
    // const res = await Coin.findAndCountAll({
    //   limit,
    //   offset,
    //   where: {
    //     senderId: request.user.id,
    //   },
    // });
    //
    // return res;
  }),
};

export default users;
