import graphql, { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User, Coin } from '../models';
import MeType from '../types/MeType';
import config from '../../config';
import CoinType from '../types/CoinType';

const sentCoins = {
  type: new GraphQLObjectType({
    name: 'SentCoinsResource',
    description: "Get a list of coins you've sent in your current relationship",
    fields: {
      rows: { type: new GraphQLList(CoinType) },
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

      const res = await Coin.findAndCountAll({
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

export default sentCoins;
