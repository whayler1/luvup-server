import graphql, { GraphQLObjectType, GraphQLID, GraphQLBoolean } from 'graphql';
import _ from 'lodash';

import LoveNoteType from '../types/LoveNoteType';
import { LoveNote } from '../models';
import validateJwtToken from '../helpers/validateJwtToken';
import { sendPushNotification } from '../../services/pushNotifications';

const updateLoveNote = {
  type: new GraphQLObjectType({
    name: 'UpdateLoveNote',
    description: 'Update Love Note values',
    fields: {
      loveNote: { type: LoveNoteType },
    },
  }),
  args: {
    loveNoteId: { type: GraphQLID },
    isRead: { type: GraphQLBoolean },
  },
  resolve: async ({ request }, { loveNoteId, isRead }) => {
    if (!loveNoteId) {
      return {};
    }

    const verify = await validateJwtToken(request);

    if (verify) {
      const loveNote = await LoveNote.findOne({
        id: loveNoteId,
      });

      if (!loveNote) {
        return {};
      }

      await loveNote.update({ isRead });

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
        },
      };
    }
    return {};
  },
};

export default updateLoveNote;
