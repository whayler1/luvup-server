import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
} from 'graphql';

const QuizItemChoiceType = new GraphQLObjectType({
  name: 'QuizItemChoice',
  description: 'A single multiple choice answer for a quiz item',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    answer: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    quizItemId: { type: GraphQLID },
  },
});

export default QuizItemChoiceType;
