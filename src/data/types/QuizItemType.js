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
import QuizItemChoiceType from './QuizItemChoiceType';

const QuizItemType = new GraphQLObjectType({
  name: 'QuizItem',
  description: 'A question with multiple choice answers',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    question: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    relationshipId: { type: GraphQLID },
    reward: { type: GraphQLInt },
    senderId: { type: GraphQLID },
    recipientId: { type: GraphQLID },
    senderChoiceId: { type: GraphQLID },
    recipientChoiceId: { type: GraphQLID },
    isArchived: { type: GraphQLBoolean },
    choices: { type: new GraphQLList(QuizItemChoiceType) },
  },
});

export default QuizItemType;
