import graphql, { GraphQLObjectType } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import RelationshipScoreType from '../types/RelationshipScoreType';
import { User } from '../models';
import config from '../../config';
import { generateScore } from '../helpers/relationshipScore';

const createRelationshipScore = {
  type: new GraphQLObjectType({
    name: 'CreateRelationshipScore',
    description:
      'creates a new RelationshipScore associated to the current user and the current users relationship',
    fields: {
      relationshipScore: { type: RelationshipScoreType },
    },
  }),
  resolve: async ({ request }) => {
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token) {
      return {};
    }
    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.findOne({ where: { id: verify.id } });

      const relationshipScore = await generateScore(user);

      return { relationshipScore };
    }
    return {};
  },
};

export default createRelationshipScore;
