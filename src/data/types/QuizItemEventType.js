import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

const QuizItemEventType = new GraphQLObjectType({
  name: 'QuizItemEvent',
  description: 'used to associate quiz items to user events',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    quizItemId: { type: GraphQLID },
    userEventId: { type: GraphQLID },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

export default QuizItemEventType;
