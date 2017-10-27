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
    // const fields = getFieldDict(ast);
    // if ('rows' in fields && 'location' in fields.rows) {
    //   const promises = res.rows.map(listing => {
    //     const promise = listing.getLocation();
    //     promise.then(location => Object.assign(listing, { location }));
    //     return promise;
    //   });
    //   await Promise.all(promises);
    // }

    return res;
  },
};

export default coins;
