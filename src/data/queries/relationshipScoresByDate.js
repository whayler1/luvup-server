import graphql, {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User, RelationshipScore } from '../models';
import config from '../../config';
import RelationshipScoreByDayType from '../types/RelationshipScoreByDayType';

const relationshipScores = {
  type: new GraphQLObjectType({
    name: 'RelationshipScoresResource',
    description: 'Get one relationship score per day between the defined dates',
    fields: {
      rows: { type: new GraphQLList(RelationshipScoreByDayType) },
      endDate: { type: GraphQLString },
      startDate: { type: GraphQLString },
    },
  }),
  args: {
    endDate: { type: GraphQLString },
    startDate: { type: GraphQLString },
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
