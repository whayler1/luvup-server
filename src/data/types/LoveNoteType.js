import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

const LoveNoteType = new GraphQLObjectType({
  name: 'LoveNote',
  description: 'A message that can have jalapenos or Luvups attached',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    note: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    relationshipId: { type: GraphQLID },
    senderId: { type: GraphQLID },
    recipientId: { type: GraphQLID },
    numLuvups: { type: GraphQLInt },
    numJalapenoes: { type: GraphQLInt },
    isRead: { type: GraphQLBoolean },
  },
});

export default LoveNoteType;
