import graphql, {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} from 'graphql';
import _ from 'lodash';

import { User, LoveNote } from '../models';
import config from '../../config';
import LoveNoteType from '../types/LoveNoteType';
import validateJwtToken from '../helpers/validateJwtToken';

const sentLoveNotes = {
  type: new GraphQLObjectType({
    name: 'SentLoveNotesResource',
    description: 'Get a list of sent love notes',
    fields: {
      rows: { type: new GraphQLList(LoveNoteType) },
      count: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      offset: { type: GraphQLInt },
    },
  }),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
    isRead: { type: GraphQLBoolean },
  },
  resolve: async ({ request }, { limit, offset, isRead }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const user = await User.findOne({ where: { id: verify.id } });
      const relationshipId = user.RelationshipId;

      const query = {
        limit,
        offset,
        where: {
          senderId: user.id,
          relationshipId,
        },
        order: [['createdAt', 'DESC']],
      };
      if (_.isBoolean(isRead)) {
        Object.assign(query.where, { isRead });
      }

      const res = await LoveNote.findAndCountAll(query);

      return {
        ..._.pick(res, ['rows', 'count']),
        limit,
        offset,
      };
    }

    return {};
  },
};

export default sentLoveNotes;
