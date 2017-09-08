import { GraphQLInt, GraphQLObjectType, GraphQLList as List } from 'graphql';
import ListingType from '../types/ListingType';
import { Listing } from '../models';

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
  resolve: async ({ request }, { limit, offset }) => {
    const items = await Listing.findAndCountAll({ limit, offset });
    console.log('\n\n ------ items', items);

    return items;
  },
};

export default listings;
