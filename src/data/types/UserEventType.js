import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

const UserEvent = new GraphQLObjectType({
  name: 'UserEvent',
  description: 'An action a user did.',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    isViewed: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    name: { type: GraphQLString },
    relationshipId: { type: GraphQLID },
    userId: { type: GraphQLID },
  },
});

export default UserEvent;
