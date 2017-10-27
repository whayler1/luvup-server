import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import me from './queries/me';
import foo from './queries/foo';
import news from './queries/news';
import listings from './queries/listings';
import coins from './queries/coins';

import fooMutation from './mutations/foo';
import createListing from './mutations/createListing';
import createCoin from './mutations/createCoin';
import updateListing from './mutations/updateListing';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      news,
      foo,
      listings,
      coins,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      fooMutation,
      createListing,
      createCoin,
      updateListing,
    },
  }),
});

export default schema;
