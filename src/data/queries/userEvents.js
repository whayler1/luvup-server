import graphql, { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User, UserEvent } from '../models';
import config from '../../config';
import UserEventType from '../types/UserEventType';

const userEvents = {
  type: new GraphQLObjectType({
    name: 'UserEventsResource',
    description:
      'Get a list of relevant user events for both you and your lover',
    fields: {
      rows: { type: new GraphQLList(UserEventType) },
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

      const res = await UserEvent.findAndCountAll({
        limit,
        offset,
        where: {
          relationshipId: user.RelationshipId,
          userId: user.id,
        },
        order: [['createdAt', 'DESC']],
      });

      return {
        count: res.count,
        rows: res.rows,
        limit,
        offset,
      };
    }

    return {};
  },
};

export default userEvents;
