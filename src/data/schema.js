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
import relationshipScoresByDay from './queries/relationshipScoresByDay';
import unviewedEventCounts from './queries/unviewedEventCounts';
import lover from './queries/lover';
import receivedLoveNotes from './queries/receivedLoveNotes';
import sentLoveNotes from './queries/sentLoveNotes';
import receivedQuizItems from './queries/receivedQuizItems';
import receivedUnansweredQuizItems from './queries/receivedUnansweredQuizItems';
import sentQuizItems from './queries/sentQuizItems';
import quizItemsByDate from './queries/quizItemsByDate';

// mutations
import userRequest from './mutations/userRequest';
import confirmUser from './mutations/confirmUser';
import requestLover from './mutations/requestLover';
import acceptLoverRequest from './mutations/acceptLoverRequest';
import cancelLoverRequest from './mutations/cancelLoverRequest';
import sendCoin from './mutations/sendCoin';
import sendJalapeno from './mutations/sendJalapeno';
import createRelationshipScore from './mutations/createRelationshipScore';
import endRelationship from './mutations/endRelationship';
import changePassword from './mutations/changePassword';
import sendNewPassword from './mutations/sendNewPassword';
import resetPasswordWithGeneratedPassword from './mutations/resetPasswordWithGeneratedPassword';
import confirmUserRequestCode from './mutations/confirmUserRequestCode';
import resendLoverRequestEmail from './mutations/resendLoverRequestEmail';
import setExpoPushToken from './mutations/setExpoPushToken';
import invalidateExpoPushToken from './mutations/invalidateExpoPushToken';
import createLoveNote from './mutations/createLoveNote';
import updateLoveNote from './mutations/updateLoveNote';
import setLoveNoteRead from './mutations/setLoveNoteRead';
import setLoveNotesReadWithCreatedAt from './mutations/setLoveNotesReadWithCreatedAt';
import createQuizItem from './mutations/createQuizItem';
import answerQuizItem from './mutations/answerQuizItem';
import archiveQuizItem from './mutations/archiveQuizItem';

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
      relationshipScoresByDay,
      unviewedEventCounts,
      lover,
      receivedLoveNotes,
      sentLoveNotes,
      receivedQuizItems,
      receivedUnansweredQuizItems,
      sentQuizItems,
      quizItemsByDate,
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
      sendNewPassword,
      resetPasswordWithGeneratedPassword,
      setExpoPushToken,
      invalidateExpoPushToken,
      createLoveNote,
      updateLoveNote,
      setLoveNoteRead,
      setLoveNotesReadWithCreatedAt,
      createQuizItem,
      answerQuizItem,
      archiveQuizItem,
    },
  }),
});

export default schema;
