import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

const LoveNoteEventType = new GraphQLObjectType({
  name: 'LoveNoteEvent',
  description: 'used to associate love notes to user events',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    userEventId: { type: GraphQLID },
    loveNoteId: { type: GraphQLID },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

export default LoveNoteEventType;
