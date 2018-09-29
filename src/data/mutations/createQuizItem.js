import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLID,
} from 'graphql';
import _ from 'lodash';

import QuizItemType from '../types/QuizItemType';
import { User } from '../models';
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
      quizItem: QuizItemType,
    },
  }),
  args: {
    question: { type: GraphQLString },
    reward: { type: GraphQLInt },
    choices: { type: new GraphQLList(GraphQLString) },
    senderChoiceId: { type: GraphQLID },
  },
  resolve: async (
    { request },
    { question, reward, choices, senderChoiceId },
  ) => {
    if (
      !question ||
      !_.isNumber(reward) ||
      !_.isArray(choices) ||
      !senderChoiceId
    ) {
      return {};
    }

    const verify = await validateJwtToken(request);

    if (verify) {
      const user = await User.findOne({ where: { id: verify.id } });
      // const relationshipId = user.RelationshipId;
      // const lover = await User.findOne({
      //   where: {
      //     RelationshipId: user.RelationshipId,
      //     $not: {
      //       id: user.id,
      //     },
      //   },
      // });
      // const loveNote = await LoveNote.create({
      //   relationshipId,
      //   note,
      //   senderId: user.id,
      //   recipientId: lover.id,
      //   numLuvups: numLuvups || 0,
      //   numJalapenos: numJalapenos || 0,
      // });
      //
      // createUserEvents(user.id, lover.id, relationshipId);
      //
      // const bulkObj = {
      //   relationshipId,
      //   senderId: user.id,
      //   recipientId: lover.id,
      //   loveNoteId: loveNote.id,
      // };
      //
      // let luvups;
      // let jalapenos;
      //
      // if (_.isNumber(numLuvups)) {
      //   luvups = await bulkCreate(Coin, numLuvups, bulkObj);
      // }
      // if (_.isNumber(numJalapenos)) {
      //   jalapenos = await bulkCreate(Jalapeno, numJalapenos, bulkObj);
      // }
      //
      // const pushNotificationBody = getNotificationBodyString(
      //   user.firstName,
      //   numLuvups,
      //   numJalapenos,
      // );
      // sendPushNotification(
      //   lover.id,
      //   pushNotificationBody,
      //   {
      //     type: 'love-note',
      //     message: pushNotificationBody,
      //   },
      //   'default',
      //   {
      //     title: 'You received a love note! 💌',
      //   },
      // );
      //
      // analytics.track({
      //   userId: user.id,
      //   event: 'createQuizItem
      // ',
      //   properties: {
      //     category: 'loveNote',
      //     loveNoteId: loveNote.id,
      //   },
      // });
      //
      // return {
      //   loveNote: {
      //     ..._.pick(loveNote, [
      //       'id',
      //       'note',
      //       'createdAt',
      //       'updatedAt',
      //       'relationshipId',
      //       'senderId',
      //       'recipientId',
      //       'isRead',
      //       'numJalapenos',
      //       'numLuvups',
      //     ]),
      //     luvups,
      //     jalapenos,
      //   },
      // };
    }
    return {};
  },
};

export default createQuizItem;
