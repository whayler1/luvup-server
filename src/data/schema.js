import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

// queries
import me from './queries/me';
import coins from './queries/coins';
import myUnusedCoins from './queries/myUnusedCoins';
import mySentCoins from './queries/mySentCoins';
import users from './queries/users';
import activeLoverRequest from './queries/activeLoverRequest';
import receivedLoverRequests from './queries/receivedLoverRequests';

// mutations
import userRequest from './mutations/userRequest';
import confirmUser from './mutations/confirmUser';
import sendNewPassword from './mutations/sendNewPassword';
import resetPassword from './mutations/resetPassword';
import createCoin from './mutations/createCoin';
import requestLover from './mutations/requestLover';
import login from './mutations/login';
import acceptLoverRequest from './mutations/acceptLoverRequest';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      coins,
      myUnusedCoins,
      mySentCoins,
      users,
      activeLoverRequest,
      receivedLoverRequests,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      userRequest,
      confirmUser,
      sendNewPassword,
      resetPassword,
      requestLover,
      createCoin,
      login,
      acceptLoverRequest,
    },
  }),
});

export default schema;
