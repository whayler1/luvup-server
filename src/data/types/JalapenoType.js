import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

const JalapenoType = new GraphQLObjectType({
  name: 'Jalapeno',
  description:
    "What you send a lover when you're not happy with their behavior or they did something you didn't like",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    isExpired: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    senderId: { type: new GraphQLNonNull(GraphQLID) },
    recipientId: { type: new GraphQLNonNull(GraphQLID) },
    relationshipId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export default JalapenoType;
