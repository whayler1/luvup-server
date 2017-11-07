import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

const LoverRequestType = new GraphQLObjectType({
  name: 'LoverRequest',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    isAccepted: { type: GraphQLBoolean },
    senderId: { type: new GraphQLNonNull(GraphQLID) },
    recipientId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export default LoverRequestType;
