import graphql, { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User, Jalapeno } from '../models';
import MeType from '../types/MeType';
import config from '../../config';
import JalapenoType from '../types/JalapenoType';

const sentJalapenos = {
  type: new GraphQLObjectType({
    name: 'SentJalapenosResource',
    description:
      "Get a list of jalapenos you've sent in your current relationship",
    fields: {
      rows: { type: new GraphQLList(JalapenoType) },
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
      const relationship = await user.getRelationship();

      const res = await Jalapeno.findAndCountAll({
        limit,
        offset,
        where: {
          senderId: user.id,
          relationshipId: relationship.id,
        },
        order: [['createdAt', 'DESC']],
      });

      const rows = res.rows.map(row => row.dataValues);

      const newResponse = Object.assign({}, res, { rows, limit, offset });

      return newResponse;
    }

    return {};
  },
};

export default sentJalapenos;
