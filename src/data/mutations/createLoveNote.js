import graphql, { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import _ from 'lodash';

import LoveNoteType from '../types/LoveNoteType';
import { User, Relationship, LoveNote } from '../models';
import config from '../../config';
import validateJwtToken from '../helpers/validateJwtToken';

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

    // if (verify) {
    // }
    return {};
  },
};

export default createLoveNote;
