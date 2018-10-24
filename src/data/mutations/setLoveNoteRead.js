import { GraphQLObjectType, GraphQLID, GraphQLNonNull } from 'graphql';

import LoveNoteType from '../types/LoveNoteType';
import validateJwtToken from '../helpers/validateJwtToken';
import { UserNotLoggedInError, LoveNoteNotFoundError } from '../errors';
import { LoveNote, User } from '../models';

const setLoveNoteRead = {
  type: new GraphQLObjectType({
    name: 'SetLoveNoteRead',
    description: 'set the is read bool of a love note to true',
    fields: {
      loveNote: { type: LoveNoteType },
    },
  }),
  args: {
    loveNoteId: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async ({ request }, { loveNoteId }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const user = await User.findOne({
        where: {
          id: verify.id,
        },
      });

      const loveNote = await LoveNote.findOne({
        where: {
          id: loveNoteId,
          recipientId: user.id,
        },
      });
      console.log('\n\n loveNote', loveNote);

      if (!loveNote) {
        throw LoveNoteNotFoundError;
      }

      return {};
    }
    throw UserNotLoggedInError;
  },
};

export default setLoveNoteRead;
