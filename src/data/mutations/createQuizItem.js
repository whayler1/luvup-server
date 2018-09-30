import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import _ from 'lodash';

import QuizItemType from '../types/QuizItemType';
import { User, UserEvent, QuizItemChoice } from '../models';
import { UserNotLoggedInError } from '../errors';
import validateJwtToken from '../helpers/validateJwtToken';
import { sendPushNotification } from '../../services/pushNotifications';
import analytics from '../../services/analytics';

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

export const createQuizItemObj = async (
  user,
  lover,
  question,
  reward,
  choices,
  senderChoiceIndex,
) => {
  const quizItem = await user.createSentQuizItem({
    question,
    reward,
    relationshipId: user.RelationshipId,
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

  return {
    ...quizItem.dataValues,
    choices: choiceObjs,
  };
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
      createUserEvents(user.id, lover.id, relationshipId);
      trackEvent(user.id, lover.id, relationshipId);

      return { quizItem };
    }
    throw UserNotLoggedInError;
  },
};

export default createQuizItem;
