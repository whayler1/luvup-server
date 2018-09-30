import {
  GraphQLObjectType,
  // GraphQLString,
  // GraphQLInt,
  // GraphQLList,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
// import _ from 'lodash';

import QuizItemType from '../types/QuizItemType';
import { QuizItem } from '../models';
import { UserNotLoggedInError, PermissionError } from '../errors';
import { validateJwtToken, getUser } from '../helpers';
// import { sendPushNotification } from '../../services/pushNotifications';
// import analytics from '../../services/analytics';

// const trackEvent = (userId, loverId, relationshipId) => {
//   analytics.track({
//     userId,
//     event: 'answerQuizItem',
//     properties: {
//       category: 'quizItem',
//       recipientId: loverId,
//       relationshipId,
//     },
//   });
// };

// const createUserEvents = (userId, loverId, relationshipId) => {
//   UserEvent.bulkCreate([
//     {
//       userId,
//       relationshipId,
//       name: 'quiz-item-sent',
//     },
//     {
//       userId: loverId,
//       relationshipId,
//       name: 'quiz-item-received',
//     },
//   ]);
// };

// const sendLoverPushNotification = (user, lover) => {
//   const message = `${_.upperFirst(user.firstName)} created a new Love Quiz!`;
//   sendPushNotification(lover.id, message, {
//     type: 'quiz-item-received',
//     message,
//   });
// };

const answerQuizItem = {
  type: new GraphQLObjectType({
    name: 'AnswerQuizItem',
    description: 'sets the recipientChoiceId of a quiz item',
    fields: {
      quizItem: { type: QuizItemType },
    },
  }),
  args: {
    quizItemId: { type: new GraphQLNonNull(GraphQLID) },
    recipientChoiceId: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async ({ request }, { quizItemId, recipientChoiceId }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const { user } = await getUser(verify.id);
      let quizItem = await QuizItem.findOne({ where: { id: quizItemId } });

      if (quizItem.recipientId === user.id) {
        quizItem = await quizItem.update({ recipientChoiceId });
        return { quizItem };
      }
      throw PermissionError;
    }
    throw UserNotLoggedInError;
  },
};

export default answerQuizItem;
