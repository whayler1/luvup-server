import graphql, { GraphQLObjectType } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import RelationshipType from '../types/RelationshipType';
import { User } from '../models';
import config from '../../config';

const endRelationship = {
  type: new GraphQLObjectType({
    name: 'EndRelationship',
    description: 'End your relationhip',
    fields: {
      relationship: { type: RelationshipType },
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
      const relationship = await user.getRelationship();

      await relationship.update({
        endDate: new Date(),
      });

      const lover = await relationship.getLover({
        where: {
          $not: {
            id: user.id,
          },
        },
      });

      await user.setRelationship(null);
      await lover.setRelationship(null);

      return { relationship };
    }
    return {};
  },
};

export default endRelationship;
