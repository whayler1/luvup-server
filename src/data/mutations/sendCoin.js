import graphql, { GraphQLObjectType } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import CoinType from '../types/CoinType';
import { User } from '../models';
import config from '../../config';
import { generateScore } from '../helpers/relationshipScore';
import analytics from '../../services/analytics';

const sendCoin = {
  type: new GraphQLObjectType({
    name: 'SendCoin',
    description:
      'Mutation to send a coin to the lover you are in a relationship with.',
    fields: {
      coin: { type: CoinType },
    },
  }),
  resolve: async ({ request }) => {
    const id_token = _.get(request, 'cookies.id_token');
    if (!id_token) {
      return {};
    }
    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.findOne({ where: { id: verify.id } });
      const relationship = await user.getRelationship();
      const recipient = await relationship.getLover({
        where: {
          $not: {
            id: user.id,
          },
        },
      });
      const coin = await relationship.createCoin({
        senderId: user.id,
        recipientId: recipient[0].id,
      });

      const userEvent = await user.createUserEvent({
        relationshipId: relationship.id,
        name: 'coin-sent',
      });
      const recipientEvent = await recipient[0].createUserEvent({
        relationshipId: relationship.id,
        name: 'coin-received',
      });

      analytics.track({
        userId: verify.id,
        event: 'sendCoin',
        properties: {
          category: 'coin',
          value: 1,
        },
      });

      /**
       * JW: Not putting `await` on generateScore so it can just happen async in
       * the background.
       */
      generateScore(recipient[0]);

      return { coin };
    }
    return {};
  },
};

export default sendCoin;
