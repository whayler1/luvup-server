import { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';

import { User, UserEvent } from '../models';
import UserEventType from '../types/UserEventType';
import { UserNotLoggedInError } from '../errors';
import { validateJwtToken } from '../helpers';

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
    const verify = await validateJwtToken(request);

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

    throw UserNotLoggedInError;
  },
};

export default userEvents;
