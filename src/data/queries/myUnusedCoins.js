import { GraphQLInt, GraphQLObjectType, GraphQLList as List } from 'graphql';
import CoinType from '../types/CoinType';
import { Coin } from '../models';
import getFieldDict from '../helpers/getFieldDict';

const myUnusedCoins = {
  type: new GraphQLObjectType({
    name: 'UnusedCoinResource',
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
    if (!('user' in request)) {
      return false;
    }
    const res = await Coin.findAndCountAll({
      limit,
      offset,
      where: {
        recipientId: request.user.id,
        isUsed: false,
      },
    });

    return res;
  },
};

export default myUnusedCoins;
