import _ from 'lodash';
import jwt from 'jsonwebtoken';

import { GraphQLInt, GraphQLObjectType, GraphQLList as List } from 'graphql';
import JalapenoType from '../types/JalapenoType';
import { User, Jalapeno } from '../models';
import config from '../../config';

const jalapenos = {
  type: new GraphQLObjectType({
    name: 'JalapenoResource',
    fields: {
      rows: { type: new List(JalapenoType) },
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

      return Object.assign({}, res, { limit, offset });
    }
    return {};
  },
};

export default jalapenos;
