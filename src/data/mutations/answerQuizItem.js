import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import _ from 'lodash';

import CoinType from '../types/CoinType';
import QuizItemType from '../types/QuizItemType';
import { QuizItem, UserEvent, Coin, QuizItemEvent } from '../models';
import { UserNotLoggedInError, PermissionError } from '../errors';
import { validateJwtToken, getUser } from '../helpers';
import { appendChoicesToQuizItems } from '../helpers/getQuizItemsWithChoices';
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

const createUserEvents = async (
  userId,
  loverId,
  relationshipId,
  quizItemId,
) => {
  const userEvents = await UserEvent.bulkCreate([
    {
      userId,
      relationshipId,
      name: 'quiz-item-received-answered',
    },
    {
      userId: loverId,
      relationshipId,
      name: 'quiz-item-sent-answered',
    },
  ]);

  const quizItemEvents = userEvents.map(userEvent => ({
    userEventId: userEvent.id,
    quizItemId,
  }));

  QuizItemEvent.bulkCreate(quizItemEvents);
};

const sendLoverPushNotification = (user, lover) => {
  const message = `${_.upperFirst(user.firstName)} answered a Love Quiz!`;
  sendPushNotification(lover.id, message, {
    type: 'quiz-item-sent-answered',
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
      const originalQuizItem = await QuizItem.findOne({
        where: { id: quizItemId },
      });

      if (originalQuizItem.recipientId === user.id) {
        const updatedQuizItem = await originalQuizItem.update({
          recipientChoiceId,
        });
        const [quizItem] = await appendChoicesToQuizItems([updatedQuizItem]);
        const coins = await createRewardIfChoicesMatch(user, lover, quizItem);
        sendLoverPushNotification(user, lover);
        createUserEvents(user.id, lover.id, user.RelationshipId, quizItemId);
        trackEvent(user.id, lover.id, user.RelationshipId);

        return { quizItem, coins };
      }
      throw PermissionError;
    }
    throw UserNotLoggedInError;
  },
};

export default answerQuizItem;
