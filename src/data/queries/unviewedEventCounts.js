import graphql, { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User, UserEvent } from '../models';
import config from '../../config';

const unviewedEventCounts = {
  type: new GraphQLObjectType({
    name: 'UnviewedEventCountsResource',
    description:
      'Counts for unviewed coins and jalapenos. This will also set isViewed to true and all items.',
    fields: {
      coinsReceived: { type: GraphQLInt },
      jalapenosReceived: { type: GraphQLInt },
    },
  }),
  resolve: async ({ request }, { limit, offset }) => {
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token) {
      return {};
    }

    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.find({ where: { id: verify.id } });
      const basePromiseQuery = {
        userId: user.id,
        relationshipId: user.RelationshipId,
        isViewed: false,
      };

      const coinPromise = UserEvent.count({
        where: {
          ...basePromiseQuery,
          name: 'coin-received',
        },
      });
      const jalapenoPromise = UserEvent.count({
        where: {
          ...basePromiseQuery,
          name: 'jalapeno-received',
        },
      });

      const [coinsReceived, jalapenosReceived] = await Promise.all([
        coinPromise,
        jalapenoPromise,
      ]);

      const updateRes = await UserEvent.update(
        { isViewed: true },
        {
          where: {
            $or: [
              {
                name: 'coin-received',
                isViewed: false,
              },
              {
                name: 'jalapeno-received',
                isViewed: false,
              },
            ],
          },
        },
      );

      return {
        coinsReceived,
        jalapenosReceived,
      };
    }

    return {};
  },
};

export default unviewedEventCounts;
