import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import _ from 'lodash';

import CoinType from '../types/CoinType';
import QuizItemType from '../types/QuizItemType';
import { QuizItem, UserEvent, Coin } from '../models';
import { UserNotLoggedInError, PermissionError } from '../errors';
import { validateJwtToken, getUser } from '../helpers';
import { sendPushNotification } from '../../services/pushNotifications';
import analytics from '../../services/analytics';

const trackEvent = (userId, loverId, relationshipId) => {
  analytics.track({
    userId,
    event: 'answerQuizItem',
    properties: {
      category: 'quizItem',
      recipientId: loverId,
      relationshipId,
    },
  });
};

const createUserEvent = (userId, relationshipId) => {
  UserEvent.create({
    userId,
    relationshipId,
    name: 'quiz-item-answered',
  });
};

const sendLoverPushNotification = (user, lover) => {
  const message = `${_.upperFirst(user.firstName)} answered a Love Quiz!`;
  sendPushNotification(lover.id, message, {
    type: 'quiz-item-answered',
    message,
  });
};

const createRewardIfChoicesMatch = async (user, lover, quizItem) => {
  const { senderChoiceId, recipientChoiceId, reward } = quizItem;
  if (senderChoiceId === recipientChoiceId && reward > 0) {
    const luvups = _.times(reward, () => ({
      relationshipId: user.RelationshipId,
      senderId: lover.id,
      recipientId: user.id,
    }));
    return Coin.bulkCreate(luvups);
  }
  return [];
};

const answerQuizItem = {
  type: new GraphQLObjectType({
    name: 'AnswerQuizItem',
    description: 'sets the recipientChoiceId of a quiz item',
    fields: {
      quizItem: { type: QuizItemType },
      coins: { type: new GraphQLList(CoinType) },
    },
  }),
  args: {
    quizItemId: { type: new GraphQLNonNull(GraphQLID) },
    recipientChoiceId: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async ({ request }, { quizItemId, recipientChoiceId }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const { user, lover } = await getUser(verify.id);
      let quizItem = await QuizItem.findOne({ where: { id: quizItemId } });

      if (quizItem.recipientId === user.id) {
        quizItem = await quizItem.update({ recipientChoiceId });
        const coins = await createRewardIfChoicesMatch(user, lover, quizItem);
        sendLoverPushNotification(user, lover);
        createUserEvent(user.id, user.RelationshipId);
        trackEvent(user.id, lover.id, user.RelationshipId);

        return { quizItem, coins };
      }
      throw PermissionError;
    }
    throw UserNotLoggedInError;
  },
};

export default answerQuizItem;
