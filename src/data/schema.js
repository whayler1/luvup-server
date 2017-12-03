import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import me from './queries/me';
import coins from './queries/coins';
import myUnusedCoins from './queries/myUnusedCoins';
import mySentCoins from './queries/mySentCoins';

import createUser from './mutations/createUser';
import userRequest from './mutations/userRequest';
import confirmUser from './mutations/confirmUser';
import createCoin from './mutations/createCoin';
import requestLover from './mutations/requestLover';
import login from './mutations/login';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      coins,
      myUnusedCoins,
      mySentCoins,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      userRequest,
      confirmUser,
      createCoin,
      login,
    },
  }),
});

export default schema;
