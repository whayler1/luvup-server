import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

// queries
import me from './queries/me';
import sentCoins from './queries/sentCoins';
import users from './queries/users';
import activeLoverRequest from './queries/activeLoverRequest';
import receivedLoverRequests from './queries/receivedLoverRequests';
import coinCount from './queries/coinCount';
import jalapenos from './queries/jalapenos';
import sentJalapenos from './queries/sentJalapenos';
import userEvents from './queries/userEvents';
import relationshipScores from './queries/relationshipScores';
import unviewedEventCounts from './queries/unviewedEventCounts';
import receivedLoveNotes from './queries/receivedLoveNotes';
import sentLoveNotes from './queries/sentLoveNotes';

// mutations
import userRequest from './mutations/userRequest';
import confirmUser from './mutations/confirmUser';
// import sendNewPassword from './mutations/sendNewPassword';
// import resetPassword from './mutations/resetPassword';
import requestLover from './mutations/requestLover';
import login from './mutations/login';
import acceptLoverRequest from './mutations/acceptLoverRequest';
import cancelLoverRequest from './mutations/cancelLoverRequest';
import sendCoin from './mutations/sendCoin';
import sendJalapeno from './mutations/sendJalapeno';
import createRelationshipScore from './mutations/createRelationshipScore';
import endRelationship from './mutations/endRelationship';
import changePassword from './mutations/changePassword';
import confirmUserRequestCode from './mutations/confirmUserRequestCode';
import resendLoverRequestEmail from './mutations/resendLoverRequestEmail';
import setExpoPushToken from './mutations/setExpoPushToken';
import invalidateExpoPushToken from './mutations/invalidateExpoPushToken';
import createLoveNote from './mutations/createLoveNote';
import updateLoveNote from './mutations/updateLoveNote';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      sentCoins,
      users,
      activeLoverRequest,
      receivedLoverRequests,
      coinCount,
      jalapenos,
      sentJalapenos,
      userEvents,
      relationshipScores,
      unviewedEventCounts,
      receivedLoveNotes,
      sentLoveNotes,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      userRequest,
      confirmUser,
      confirmUserRequestCode,
      // sendNewPassword,
      // resetPassword,
      requestLover,
      acceptLoverRequest,
      cancelLoverRequest,
      resendLoverRequestEmail,
      sendCoin,
      sendJalapeno,
      createRelationshipScore,
      endRelationship,
      changePassword,
      setExpoPushToken,
      invalidateExpoPushToken,
      createLoveNote,
      updateLoveNote,
    },
  }),
});

export default schema;
