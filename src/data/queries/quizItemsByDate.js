import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import _ from 'lodash';
import { QuizItemType } from '../models';
import { validateJwtToken, getUser, getQuizItemsWithChoices } from '../helpers';
import { UserNotLoggedInError } from '../errors';

const quizItemsByDate = {
  type: new GraphQLObjectType({
    name: 'QuizItemsByDate',
    description: 'returns an array of quiz items between two dates',
    fields: {
      rows: { type: new GraphQLList(QuizItemType) },
      endDate: { type: GraphQLString },
      startDate: { type: GraphQLString },
      // firstDate: { type: GraphQLString },
    },
  }),
  args: {
    offset: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: async ({ request }, { endDate, startDate }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const { user } = await getUser(verify.id);
      const endDateObj = new Date(endDate);
      const createdAtArgs = {
        $gte: endDateObj,
      };

      if (_.isString(startDate)) {
        createdAtArgs.$lte = new Date(startDate);
      }

      const {
        rows,
      } = await getQuizItemsWithChoices(user.RelationshipId, 999, 0, {
        createdAt: createdAtArgs,
      });

      return {
        rows,
        endDate,
        startDate,
      };
    }
    throw UserNotLoggedInError;
  },
};

export default quizItemsByDate;
