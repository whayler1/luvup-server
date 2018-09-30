import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  // GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import _ from 'lodash';

import QuizItemType from '../types/QuizItemType';
import { User, UserEvent, QuizItemChoice } from '../models';
import { UserNotLoggedInError } from '../errors';
// import config from '../../config';
import validateJwtToken from '../helpers/validateJwtToken';
import { sendPushNotification } from '../../services/pushNotifications';
import analytics from '../../services/analytics';

const trackEvent = (userId, loverId, relationshipId) => {
  analytics.track({
    userId,
    event: 'createQuizItem',
    properties: {
      category: 'quizItem',
      recipientId: loverId,
      relationshipId,
    },
  });
};

const createUserEvents = (userId, loverId, relationshipId) => {
  UserEvent.bulkCreate([
    {
      userId,
      relationshipId,
      name: 'quiz-item-sent',
    },
    {
      userId: loverId,
      relationshipId,
      name: 'quiz-item-received',
    },
  ]);
};

const sendLoverPushNotification = (user, lover) => {
  const message = `${_.upperFirst(user.firstName)} created a new Love Quiz!`;
  sendPushNotification(lover.id, message, {
    type: 'quiz-item-received',
    message,
  });
};

const createQuizItem = {
  type: new GraphQLObjectType({
    name: 'CreateQuizItem',
    description: 'creates a new QuizItem.',
    fields: {
      quizItem: { type: QuizItemType },
    },
  }),
  args: {
    question: { type: new GraphQLNonNull(GraphQLString) },
    reward: { type: new GraphQLNonNull(GraphQLInt) },
    choices: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
    senderChoiceIndex: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: async (
    { request },
    { question, reward, choices, senderChoiceIndex },
  ) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const user = await User.findOne({ where: { id: verify.id } });
      const relationshipId = user.RelationshipId;
      const lover = await User.findOne({
        where: {
          RelationshipId: relationshipId,
          $not: {
            id: user.id,
          },
        },
      });
      const quizItem = await user.createSentQuizItem({
        question,
        reward,
        relationshipId,
        recipientId: lover.id,
      });

      const choiceObjs = await QuizItemChoice.bulkCreate(
        choices.map(answer => ({
          answer,
          quizItemId: quizItem.id,
        })),
      );

      await quizItem.update({
        senderChoiceId: choiceObjs[senderChoiceIndex].id,
      });

      sendLoverPushNotification(user, lover);
      createUserEvents(user.id, lover.id, relationshipId);
      trackEvent(user.id, lover.id, relationshipId);

      return {
        quizItem: {
          ...quizItem.dataValues,
          choices: choiceObjs,
        },
      };
    }
    throw UserNotLoggedInError;
  },
};

export default createQuizItem;
