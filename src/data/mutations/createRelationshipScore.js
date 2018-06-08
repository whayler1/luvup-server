import graphql, { GraphQLObjectType, GraphQLID, GraphQLString } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import RelationshipScoreType from '../types/RelationshipScoreType';
import { User } from '../models';
import config from '../../config';
import { generateScore } from '../helpers/relationshipScore';

const getGeneratedScore = async userId => {
  const user = await User.findOne({ where: { id: userId } });
  const relationshipScore = await generateScore(user);
  return relationshipScore;
};

const createRelationshipScore = {
  type: new GraphQLObjectType({
    name: 'CreateRelationshipScore',
    description:
      'creates a new RelationshipScore associated to the current user and the current users relationship',
    fields: {
      relationshipScore: { type: RelationshipScoreType },
    },
  }),
  args: {
    userId: { type: GraphQLID },
    token: { type: GraphQLString },
  },
  resolve: async ({ request }, { userId, token }) => {
    if (token && token === config.adminToken) {
      const relationshipScore = await getGeneratedScore(userId);
      return { relationshipScore };
    }
    const id_token = _.get(request, 'cookies.id_token');
    if (!id_token) {
      return {};
    }
    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const relationshipScore = await getGeneratedScore(verify.id);
      return { relationshipScore };
    }

    return {};
  },
};

export default createRelationshipScore;
