import {
  GraphQLObjectType,
  // GraphQLID,
  // GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
} from 'graphql';
import _ from 'lodash';

import QuizItemType from '../types/QuizItemType';
import { QuizItem } from '../models';
import { UserNotLoggedInError } from '../errors';
import { validateJwtToken, getUser } from '../helpers';
// import { sendPushNotification } from '../../services/pushNotifications';
// import analytics from '../../services/analytics';

// const trackEvent = (userId, loverId, relationshipId) => {
//   analytics.track({
//     userId,
//     event: 'receivedQuizItems',
//     properties: {
//       category: 'quizItem',
//       recipientId: loverId,
//       relationshipId,
//     },
//   });
// };
//
// const createUserEvent = (userId, relationshipId) => {
//   UserEvent.create({
//     userId,
//     relationshipId,
//     name: 'quiz-item-answered',
//   });
// };
//
// const sendLoverPushNotification = (user, lover) => {
//   const message = `${_.upperFirst(user.firstName)} answered a Love Quiz!`;
//   sendPushNotification(lover.id, message, {
//     type: 'quiz-item-answered',
//     message,
//   });
// };

// const createRewardIfChoicesMatch = async (user, lover, quizItem) => {
//   const { senderChoiceId, recipientChoiceId, reward } = quizItem;
//   if (senderChoiceId === recipientChoiceId && reward > 0) {
//     const luvups = _.times(reward, () => ({
//       relationshipId: user.RelationshipId,
//       senderId: lover.id,
//       recipientId: user.id,
//     }));
//     return Coin.bulkCreate(luvups);
//   }
//   return [];
// };

const receivedQuizItems = {
  type: new GraphQLObjectType({
    name: 'ReceivedQuizItems',
    description: 'quiz items the current user has received',
    fields: {
      rows: { type: new GraphQLList(QuizItemType) },
      count: { type: GraphQLInt },
      offset: { type: GraphQLInt },
      limit: { type: GraphQLInt },
    },
  }),
  args: {
    offset: { type: GraphQLInt },
    limit: { type: GraphQLInt },
  },
  resolve: async ({ request }, { offset = 0, limit = 20 }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const { user } = await getUser(verify.id);

      const res = await QuizItem.findAndCountAll({
        limit,
        offset,
        where: {
          recipientId: user.id,
          relationshipId: user.RelationshipId,
        },
        order: [['createdAt', 'DESC']],
      });

      return {
        ..._.pick(res, ['rows', 'count']),
        limit,
        offset,
      };
    }
    throw UserNotLoggedInError;
  },
};

export default receivedQuizItems;
