import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import me from './queries/me';
import foo from './queries/foo';
import news from './queries/news';
import listings from './queries/listings';
import coins from './queries/coins';
import myUnusedCoins from './queries/myUnusedCoins';
import mySentCoins from './queries/mySentCoins';

import fooMutation from './mutations/foo';
import createUser from './mutations/createUser';
import userRequest from './mutations/userRequest';
import confirmUser from './mutations/confirmUser';
import createCoin from './mutations/createCoin';
import updateListing from './mutations/updateListing';
import requestLover from './mutations/requestLover';
import login from './mutations/login';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      news,
      foo,
      listings,
      coins,
      myUnusedCoins,
      mySentCoins,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      fooMutation,
      createUser,
      userRequest,
      confirmUser,
      createCoin,
      updateListing,
      login,
    },
  }),
});

export default schema;
