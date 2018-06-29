import graphql, { GraphQLInt, GraphQLString, GraphQLObjectType } from 'graphql';
import _ from 'lodash';

// import LoveNoteType from '../types/LoveNoteType';
import { User, LoveNote, Coin, Jalapeno, UserEvent } from '../models';
import config from '../../config';
import validateJwtToken from '../helpers/validateJwtToken';

const setLoveNotesReadWithCreatedAt = {
  type: new GraphQLObjectType({
    name: 'SetLoveNotesReadWithCreatedAt',
    description:
      'Sets all love notes to `isRead: true` with `createdAt` before a date.',
    fields: {
      count: { type: GraphQLInt },
    },
  }),
  args: {
    createdAt: { type: GraphQLString },
  },
  resolve: async ({ request }, { createdAt }) => {
    if (!createdAt) {
      throw new Error('createdAt required');
    }

    const verify = await validateJwtToken(request);

    if (verify) {
      const user = await User.findOne({ where: { id: verify.id } });

      const [count] = await LoveNote.update(
        { isRead: true },
        {
          where: {
            recipientId: verify.id,
            relationshipId: user.RelationshipId,
            isRead: false,
            createdAt: {
              $lte: new Date(createdAt),
            },
          },
        },
      );

      if (_.isNumber(count)) {
        return { count };
      }
      throw new Error('bad response');
    }
    throw new Error('invalid credentials');
  },
};

export default setLoveNotesReadWithCreatedAt;
