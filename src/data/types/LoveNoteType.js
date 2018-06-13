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
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    relationshipId: { type: GraphQLID },
    senderId: { type: GraphQLID },
    recipientId: { type: GraphQLID },
    numLuvups: { type: GraphQLInt },
    numJalapenoes: { type: GraphQLInt },
  },
});

export default LoveNoteType;
