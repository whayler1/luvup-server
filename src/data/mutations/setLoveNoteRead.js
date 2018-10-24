import { GraphQLObjectType, GraphQLID, GraphQLNonNull } from 'graphql';

import LoveNoteType from '../types/LoveNoteType';
import validateJwtToken from '../helpers/validateJwtToken';
import { UserNotLoggedInError } from '../errors';

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
    console.log('loveNoteId', loveNoteId);

    if (verify) {
      return {};
    }
    throw UserNotLoggedInError;
  },
};

export default setLoveNoteRead;
