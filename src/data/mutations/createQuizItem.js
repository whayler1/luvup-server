import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  // GraphQLID,
  GraphQLNonNull,
} from 'graphql';
// import _ from 'lodash';

import QuizItemType from '../types/QuizItemType';
import { User, QuizItemChoice } from '../models';
// import config from '../../config';
import validateJwtToken from '../helpers/validateJwtToken';
// import { sendPushNotification } from '../../services/pushNotifications';
// import analytics from '../../services/analytics';

// const createUserEvents = (userId, loverId, relationshipId) => {
//   UserEvent.bulkCreate([
//     {
//       userId,
//       relationshipId,
//       name: 'lovenote-sent',
//     },
//     {
//       userId: loverId,
//       relationshipId,
//       name: 'lovenote-received',
//     },
//   ]);
// };

// const getPluralTokenText = (n, verb) => `${n} ${verb}${n !== 1 ? 's' : ''}`;

// const getNotificationBodyString = (loverFirstName, numLuvups, numJalapenos) => {
//   const tokenStrs = [];
//   let tokenText = '';
//   if (numLuvups) {
//     tokenStrs.push(getPluralTokenText(numLuvups, 'Luvup'));
//   }
//   if (numJalapenos) {
//     tokenStrs.push(getPluralTokenText(numJalapenos, 'jalapeno'));
//   }
//   if (tokenStrs.length) {
//     tokenText = ` with ${tokenStrs.join(' & ')} attached`;
//   }
//   return `${_.upperFirst(loverFirstName)} sent you a love note${tokenText}!`;
// };

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
      const quizItem = await user.createSentQuizItem({
        question,
        reward,
        relationshipId,
        // senderChoiceId,
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
      // console.log('choices', choiceObjs);
      console.log('quizItem', quizItem.dataValues);

      return {
        quizItem: {
          ...quizItem.dataValues,
          choices: choiceObjs,
        },
      };
    }
    return {};
  },
};

export default createQuizItem;
