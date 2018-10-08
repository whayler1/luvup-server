import { GraphQLObjectType, GraphQLList, GraphQLInt } from 'graphql';

import QuizItemType from '../types/QuizItemType';
import { UserNotLoggedInError } from '../errors';
import { validateJwtToken, getUser, getQuizItemsWithChoices } from '../helpers';

const receivedQuizItems = {
  type: new GraphQLObjectType({
    name: 'ReceivedQuizItems',
    description: 'quiz items the current user has received',
    fields: {
      rows: { type: new GraphQLList(QuizItemType) },
      count: { type: GraphQLInt },
      offset: { type: GraphQLInt },
      limit: { type: GraphQLInt },
    },
  }),
  args: {
    offset: { type: GraphQLInt },
    limit: { type: GraphQLInt },
  },
  resolve: async ({ request }, { offset, limit }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const { user } = await getUser(verify.id);

      const {
        rows,
        count,
      } = await getQuizItemsWithChoices(user.RelationshipId, limit, offset, {
        recipientId: user.id,
      });

      return {
        rows,
        count,
        limit,
        offset,
      };
    }
    throw UserNotLoggedInError;
  },
};

export default receivedQuizItems;
