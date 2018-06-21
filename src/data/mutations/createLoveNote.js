import graphql, { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import _ from 'lodash';

import LoveNoteType from '../types/LoveNoteType';
import { User, LoveNote, Coin, Jalapeno } from '../models';
import config from '../../config';
import validateJwtToken from '../helpers/validateJwtToken';
import { sendPushNotification } from '../../services/pushNotifications';

const bulkCreate = async (
  model,
  count,
  { relationshipId, senderId, recipientId, loveNoteId },
) => {
  const values = _.times(count, () => ({
    relationshipId,
    senderId,
    recipientId,
    loveNoteId,
  }));
  const models = await model.bulkCreate(values);

  return models;
};

const createLoveNote = {
  type: new GraphQLObjectType({
    name: 'CreateLoveNote',
    description:
      'creates a new love note. Love notes have text and optional Luvups/jalapenos.',
    fields: {
      loveNote: { type: LoveNoteType },
    },
  }),
  args: {
    note: { type: GraphQLString },
    numJalapenos: { type: GraphQLInt },
    numLuvups: { type: GraphQLInt },
  },
  resolve: async ({ request }, { note, numJalapenos, numLuvups }) => {
    if (!note) {
      return {};
    }

    const verify = await validateJwtToken(request);

    if (verify) {
      const user = await User.findOne({ where: { id: verify.id } });
      const relationshipId = user.RelationshipId;
      const lover = await User.findOne({
        where: {
          RelationshipId: user.RelationshipId,
          $not: {
            id: user.id,
          },
        },
      });
      const loveNote = await LoveNote.create({
        relationshipId,
        note,
        senderId: user.id,
        recipientId: lover.id,
      });

      const bulkFunc = () => ({
        relationshipId,
        senderId: user.id,
        recipientId: lover.id,
        loveNoteId: loveNote.id,
      });

      if (_.isNumber(numLuvups)) {
        await bulkCreate(Coin, numLuvups, bulkFunc);
      }
      if (_.isNumber(numJalapenos)) {
        await bulkCreate(Jalapeno, numJalapenos, bulkFunc);
      }

      const pushNotificationTitle = `${user.firstName} sent you a love note! 💌`;
      sendPushNotification(
        lover.id,
        note,
        {
          type: 'love-note',
          message: pushNotificationTitle,
        },
        'default',
        {
          title: pushNotificationTitle,
        },
      );

      return {
        loveNote: {
          ..._.pick(loveNote, [
            'id',
            'note',
            'createdAt',
            'updatedAt',
            'relationshipId',
            'senderId',
            'recipientId',
            'isRead',
          ]),
          numJalapenos,
          numLuvups,
        },
      };
    }
    return {};
  },
};

export default createLoveNote;
