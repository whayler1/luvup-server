import { GraphQLInt, GraphQLObjectType, GraphQLList as List } from 'graphql';
import CoinType from '../types/CoinType';
import { Coin, User } from '../models';

const mySentCoins = {
  type: new GraphQLObjectType({
    name: 'SentCoinResource',
    fields: {
      rows: { type: new List(CoinType) },
      count: { type: GraphQLInt },
    },
  }),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  resolve: async ({ request }, { limit, offset }) => {
    if (!('user' in request) && !('id' in request.user)) {
      return false;
    }

    const res = await Coin.findAndCountAll({
      limit,
      offset,
      where: {
        senderId: request.user.id,
      },
    });

    return res;
  },
};

export default mySentCoins;
