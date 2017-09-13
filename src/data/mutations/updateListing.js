import graphql, {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';
import _ from 'lodash';
import ListingType from '../types/ListingType';
import { Listing, Location } from '../models';

const args = {
  id: {
    type: GraphQLID,
    required: true,
  },
  price: { type: GraphQLFloat },
  name: { type: GraphQLString },
};

const updateListing = {
  type: ListingType,
  args,
  resolve: async ({ request }, { id, price, name }) => {
    // const listings = await Listing.update(
    //   _.omitBy({ price, name }, _.isNil),
    //   { where: { id } }
    // );
    const listing = await Listing.findOne({
      where: { id },
    });
    console.log('\n\n >>>>-<>--> listing', listing);
    await listing.update(_.omitBy({ price, name }, _.isNil));

    console.log('\n\n-<>--> listing', listing);
    // const { user } = request;
    // const listing = await Listing.create({
    //   userId: user.id,
    //   name,
    // });
    // const location = await Location.create({
    //   listingId: listing.id,
    // });
    // await listing.setLocation(location);
    // const loc = await listing.getLocation();
    // // console.log('\n\n loc', loc);
    // console.log('\n\nlisting', listing);

    return listing;
  },
};

export default updateListing;
