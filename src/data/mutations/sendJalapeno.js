import { GraphQLObjectType } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import JalapenoType from '../types/JalapenoType';
import RelationshipScoreType from '../types/RelationshipScoreType';
import { User } from '../models';
import config from '../../config';
import { generateScore } from '../helpers/relationshipScore';
import analytics from '../../services/analytics';
import { sendPushNotification } from '../../services/pushNotifications';

const sendJalapeno = {
  type: new GraphQLObjectType({
    name: 'SendJalapeno',
    description:
      'Mutation to send a jalapeno to the lover you are in a relationship with.',
    fields: {
      jalapeno: { type: JalapenoType },
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
      const jalapeno = await relationship.createJalapeno({
        senderId: user.id,
        recipientId: recipient.id,
      });

      user.createUserEvent({
        relationshipId: relationship.id,
        name: 'jalapeno-sent',
      });
      recipient.createUserEvent({
        relationshipId: relationship.id,
        name: 'jalapeno-received',
      });

      analytics.track({
        userId: verify.id,
        event: 'sendJalapeno',
        properties: {
          category: 'jalapeno',
          value: 1,
        },
      });

      sendPushNotification(recipient.id, 'You received a jalapeno 🌶', {
        type: 'jalapeno-received',
      });

      generateScore(recipient);
      const relationshipScore = await generateScore(user);

      return { jalapeno, relationshipScore };
    }
    return {};
  },
};

export default sendJalapeno;
