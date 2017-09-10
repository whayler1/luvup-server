import { GraphQLInt, GraphQLObjectType, GraphQLList as List } from 'graphql';
import ListingType from '../types/ListingType';
import { Listing } from '../models';
import getFieldDict from '../helpers/getFieldDict';

const listings = {
  type: new GraphQLObjectType({
    name: 'ListingResource',
    fields: {
      rows: { type: new List(ListingType) },
      count: { type: GraphQLInt },
    },
  }),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  resolve: async ({ request }, { limit, offset }, root, ast) => {
    const res = await Listing.findAndCountAll({ limit, offset });
    const fields = getFieldDict(ast);
    if ('rows' in fields && 'location' in fields.rows) {
      const promises = res.rows.map(listing => {
        const promise = listing.getLocation();
        promise.then(location => Object.assign(listing, { location }));
        return promise;
      });
      await Promise.all(promises);
    }

    return res;
  },
};

export default listings;
