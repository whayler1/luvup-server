import graphql, { GraphQLString, GraphQLID } from 'graphql';
import ListingType from '../types/ListingType';
import { Listing, Location } from '../models';

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
    const location = await Location.create({
      listingId: listing.id,
    });
    await listing.setLocation(location);
    const loc = await listing.getLocation();
    console.log('\n\n loc', loc);

    return {
      ...listing,
      location: loc,
    };
  },
};

export default createListing;
