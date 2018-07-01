import { GraphQLInt, GraphQLObjectType, GraphQLList as List } from 'graphql';
import CoinType from '../types/CoinType';
import { Coin } from '../models';
import getFieldDict from '../helpers/getFieldDict';

const coins = {
  type: new GraphQLObjectType({
    name: 'CoinResource',
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
    const res = await Coin.findAndCountAll({ limit, offset });

    return res;
  },
};

export default coins;
