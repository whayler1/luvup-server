import { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User, RelationshipScore } from '../models';
import config from '../../config';
import RelationshipScoreType from '../types/RelationshipScoreType';

const relationshipScores = {
  type: new GraphQLObjectType({
    name: 'RelationshipScoresResource',
    description:
      'Get a list of relationship scores from your current relationship',
    fields: {
      rows: { type: new GraphQLList(RelationshipScoreType) },
      count: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      offset: { type: GraphQLInt },
    },
  }),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  resolve: async ({ request }, { limit, offset }) => {
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token) {
      return {};
    }

    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.find({ where: { id: verify.id } });

      const res = await RelationshipScore.findAndCountAll({
        limit,
        offset,
        where: {
          userId: user.id,
          relationshipId: user.RelationshipId,
        },
        order: [['createdAt', 'DESC']],
      });

      return {
        ..._.pick(res, ['rows', 'count']),
        limit,
        offset,
      };
    }

    return {};
  },
};

export default relationshipScores;
