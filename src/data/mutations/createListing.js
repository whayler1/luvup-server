import graphql, { GraphQLString, GraphQLID } from 'graphql';
import ListingType from '../types/ListingType';
import { Listing } from '../models';

const createListing = {
  type: ListingType,
  args: {
    name: { type: GraphQLString },
  },
  resolve: async ({ request }, { name }) => {
    const { user } = request;
    const listing = await Listing.create({
      userId: user.id,
      name,
    });
    return listing;
  },
};

export default createListing;
