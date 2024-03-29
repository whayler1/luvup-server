import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import _ from 'lodash';

import QuizItemType from '../types/QuizItemType';
import { User, UserEvent, QuizItemEvent } from '../models';
import { UserNotLoggedInError } from '../errors';
import validateJwtToken from '../helpers/validateJwtToken';
import { sendPushNotification } from '../../services/pushNotifications';
import analytics from '../../services/analytics';
import { createQuizItem as createQuizItemObj } from '../helpers';

const getUserAndLover = async userId => {
  const user = await User.findOne({ where: { id: userId } });
  const relationshipId = user.RelationshipId;
  const lover = await User.findOne({
    where: {
      RelationshipId: relationshipId,
      $not: {
        id: user.id,
      },
    },
  });
  return { user, lover, relationshipId };
};

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
      name: 'quiz-item-sent',
    },
    {
      userId: loverId,
      relationshipId,
      name: 'quiz-item-received',
    },
  ]);
  const quizItemEvents = userEvents.map(userEvent => ({
    userEventId: userEvent.id,
    quizItemId,
  }));
  QuizItemEvent.bulkCreate(quizItemEvents);
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
      const { user, lover, relationshipId } = await getUserAndLover(verify.id);
      const quizItem = await createQuizItemObj(
        user,
        lover,
        question,
        reward,
        choices,
        senderChoiceIndex,
      );

      sendLoverPushNotification(user, lover);
      createUserEvents(user.id, lover.id, relationshipId, quizItem.id);
      trackEvent(user.id, lover.id, relationshipId);

      return { quizItem };
    }
    throw UserNotLoggedInError;
  },
};

export default createQuizItem;
