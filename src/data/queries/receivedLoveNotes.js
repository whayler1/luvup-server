import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} from 'graphql';
import _ from 'lodash';

import { User, LoveNote } from '../models';
import LoveNoteType from '../types/LoveNoteType';
import validateJwtToken from '../helpers/validateJwtToken';

const receivedLoveNotes = {
  type: new GraphQLObjectType({
    name: 'ReceivedLoveNotesResource',
    description: 'Get a list of received love notes',
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
      const recipientId = verify.id;
      const relationshipId = user.RelationshipId;
      const isReadSet = _.isBoolean(isRead);

      const query = {
        limit,
        offset,
        where: {
          recipientId,
          relationshipId,
        },
        order: [['createdAt', 'DESC']],
      };
      if (isReadSet) {
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

export default receivedLoveNotes;
