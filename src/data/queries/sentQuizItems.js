import { GraphQLObjectType, GraphQLList, GraphQLInt } from 'graphql';

import QuizItemType from '../types/QuizItemType';
import { UserNotLoggedInError } from '../errors';
import { validateJwtToken, getUser, getQuizItemsWithChoices } from '../helpers';

const sentQuizItems = {
  type: new GraphQLObjectType({
    name: 'SentQuizItems',
    description: 'quiz items the current user has sent',
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
  resolve: async ({ request }, { offset = 0, limit = 20 }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const { user } = await getUser(verify.id);

      const {
        rows,
        count,
      } = await getQuizItemsWithChoices(user, limit, offset, {
        senderId: user.id,
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

export default sentQuizItems;
