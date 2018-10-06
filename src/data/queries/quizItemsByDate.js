import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import { QuizItemType } from '../models';
import validateJwtToken from '../helpers/validateJwtToken';
import { UserNotLoggedInError } from '../errors';

const quizItemsByDate = {
  type: new GraphQLObjectType({
    name: 'QuizItemsByDate',
    description: 'returns an array of quiz items between two dates',
    fields: {
      rows: { type: new GraphQLList(QuizItemType) },
      endDate: { type: GraphQLString },
      startDate: { type: GraphQLString },
      firstDate: { type: GraphQLString },
    },
  }),
  args: {
    offset: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: async ({ request } /* { endDate, startDate } */) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      // do a thing now brahz
    }
    throw UserNotLoggedInError;
  },
};

export default quizItemsByDate;
