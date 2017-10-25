import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
import CoinType from '../types/CoinType';
import { Coin } from '../models';

const createCoin = {
  type: CoinType,
  // args: {
  //   name: { type: GraphQLString },
  // },
  resolve: async ({ request }) => {
    const { user } = request;
    const coin = await Coin.create(
      {
        // userId: user.id
      },
    );
    console.log('Coin', coin);
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

    return coin;
  },
};

export default createCoin;
