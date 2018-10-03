import { GraphQLObjectType, GraphQLList, GraphQLInt } from 'graphql';

import QuizItemType from '../types/QuizItemType';
import { QuizItem } from '../models';
import { UserNotLoggedInError } from '../errors';
import {
  validateJwtToken,
  getUser,
  appendChoicesToQuizItems,
} from '../helpers';

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
  resolve: async ({ request }, { offset = 0, limit = 20 }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const { user } = await getUser(verify.id);

      const res = await QuizItem.findAndCountAll({
        limit,
        offset,
        where: {
          recipientId: user.id,
          relationshipId: user.RelationshipId,
        },
        order: [['createdAt', 'DESC']],
      });

      const { rows, count } = res;

      const quizItemsWithChoices = await appendChoicesToQuizItems(rows);

      return {
        rows: quizItemsWithChoices,
        count,
        limit,
        offset,
      };
    }
    throw UserNotLoggedInError;
  },
};

export default receivedQuizItems;
