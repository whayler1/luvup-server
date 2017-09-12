import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
import ListingType from '../types/ListingType';
import { Listing, Location } from '../models';

const updateListing = {
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
    // console.log('\n\n loc', loc);
    console.log('\n\nlisting', listing);

    return {
      ..._.pick(listing, 'name', 'id', 'userId'),
      location: loc,
    };
  },
};

export default updateListing;
