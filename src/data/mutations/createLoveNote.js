import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import _ from 'lodash';

import LoveNoteType from '../types/LoveNoteType';
import {
  User,
  LoveNote,
  LoveNoteEvent,
  Coin,
  Jalapeno,
  UserEvent,
} from '../models';
import validateJwtToken from '../helpers/validateJwtToken';
import { sendPushNotification } from '../../services/pushNotifications';
import analytics from '../../services/analytics';
import { UserNotLoggedInError } from '../errors';

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

const createUserEvents = async (
  userId,
  loverId,
  relationshipId,
  loveNoteId,
) => {
  const userEvents = await UserEvent.bulkCreate([
    {
      userId,
      relationshipId,
      name: 'lovenote-sent',
    },
    {
      userId: loverId,
      relationshipId,
      name: 'lovenote-received',
    },
  ]);
  const loveNoteEventProps = userEvents.map(userEvent => ({
    userEventId: userEvent.id,
    loveNoteId,
  }));

  LoveNoteEvent.bulkCreate(loveNoteEventProps);
};

const getPluralTokenText = (n, verb) => `${n} ${verb}${n !== 1 ? 's' : ''}`;

const getNotificationBodyString = (loverFirstName, numLuvups, numJalapenos) => {
  const tokenStrs = [];
  let tokenText = '';
  if (numLuvups) {
    tokenStrs.push(getPluralTokenText(numLuvups, 'Luvup'));
  }
  if (numJalapenos) {
    tokenStrs.push(getPluralTokenText(numJalapenos, 'jalapeno'));
  }
  if (tokenStrs.length) {
    tokenText = ` with ${tokenStrs.join(' & ')} attached`;
  }
  return `${_.upperFirst(loverFirstName)} sent you a love note${tokenText}!`;
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
    note: { type: new GraphQLNonNull(GraphQLString) },
    numJalapenos: { type: GraphQLInt },
    numLuvups: { type: GraphQLInt },
  },
  resolve: async ({ request }, { note, numJalapenos, numLuvups }) => {
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
        numLuvups: numLuvups || 0,
        numJalapenos: numJalapenos || 0,
      });

      createUserEvents(user.id, lover.id, relationshipId, loveNote.id);

      const bulkObj = {
        relationshipId,
        senderId: user.id,
        recipientId: lover.id,
        loveNoteId: loveNote.id,
      };

      let luvups;
      let jalapenos;

      if (_.isNumber(numLuvups)) {
        luvups = await bulkCreate(Coin, numLuvups, bulkObj);
      }
      if (_.isNumber(numJalapenos)) {
        jalapenos = await bulkCreate(Jalapeno, numJalapenos, bulkObj);
      }

      const pushNotificationBody = getNotificationBodyString(
        user.firstName,
        numLuvups,
        numJalapenos,
      );
      sendPushNotification(
        lover.id,
        pushNotificationBody,
        {
          type: 'love-note',
          message: pushNotificationBody,
        },
        'default',
        {
          title: 'You received a love note! 💌',
        },
      );

      analytics.track({
        userId: user.id,
        event: 'createLoveNote',
        properties: {
          category: 'loveNote',
          loveNoteId: loveNote.id,
        },
      });

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
            'numJalapenos',
            'numLuvups',
          ]),
          luvups,
          jalapenos,
        },
      };
    }
    throw UserNotLoggedInError;
  },
};

export default createLoveNote;
