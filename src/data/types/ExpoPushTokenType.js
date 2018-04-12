import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

const ExpoPushTokenType = new GraphQLObjectType({
  name: 'ExpoPushToken',
  description: 'The token needed to send push notifications',
  fields: {
    id: { type: GraphQLID },
    token: { type: GraphQLString },
    isValid: { type: GraphQLBoolean },
    userId: { type: GraphQLID },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

export default ExpoPushTokenType;
