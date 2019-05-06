import { GraphQLObjectType } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import CoinType from '../types/CoinType';
import RelationshipScoreType from '../types/RelationshipScoreType';
import { User } from '../models';
import config from '../../config';
import { generateScore } from '../helpers/relationshipScore';
import analytics from '../../services/analytics';
import { sendPushNotification } from '../../services/pushNotifications';

const sendCoin = {
  type: new GraphQLObjectType({
    name: 'SendCoin',
    description:
      'Mutation to send a coin to the lover you are in a relationship with.',
    fields: {
      coin: { type: CoinType },
      relationshipScore: { type: RelationshipScoreType },
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
      const [recipient] = await relationship.getLover({
        where: {
          $not: {
            id: user.id,
          },
        },
      });
      const coin = await relationship.createCoin({
        senderId: user.id,
        recipientId: recipient.id,
      });

      user.createUserEvent({
        relationshipId: relationship.id,
        name: 'coin-sent',
      });
      recipient.createUserEvent({
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

      sendPushNotification(recipient.id, 'You received a Luvup! ❤️', {
        type: 'luvup-received',
      });

      const relationshipScore = await generateScore(recipient);

      return { coin, relationshipScore };
    }
    return {};
  },
};

export default sendCoin;
