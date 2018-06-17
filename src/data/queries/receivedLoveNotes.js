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
      const query = {
        limit,
        offset,
        where: {
          recipientId: verify.id,
          relationshipId: user.RelationshipId,
        },
        order: [['createdAt', 'DESC']],
      };
      if (_.isBoolean(isRead)) {
        Object.assign(query.where, { isRead });
      }
      console.log('\n\nquery', query);
      const res = await LoveNote.findAndCountAll(query);
      console.log('\n\nres\n---', res);
      //
      // const res = await RelationshipScore.findAndCountAll({
      //   limit,
      //   offset,
      //   where: {
      //     userId: user.id,
      //     relationshipId: user.RelationshipId,
      //   },
      //   order: [['createdAt', 'DESC']],
      // });
      //
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
