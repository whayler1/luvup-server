import { GraphQLObjectType, GraphQLInt } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User, Coin } from '../models';
import config from '../../config';

const coinCount = {
  type: new GraphQLObjectType({
    name: 'CoinCount',
    description:
      'The number of unused coins a user has in their current relationship',
    fields: {
      count: { type: GraphQLInt },
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
      const count = await Coin.count({
        where: {
          relationshipId: relationship.id,
          recipientId: user.id,
          isUsed: false,
        },
      });

      return { count };
    }
    return {};
  },
};

export default coinCount;
