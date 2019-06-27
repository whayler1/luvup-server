import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import GraphQLEmail from 'graphql-type-email';

const UserInviteType = new GraphQLObjectType({
  name: 'UserInvite',
  description: 'An invite that can be used to create a user',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    relationshipId: { type: GraphQLID },
    senderId: { type: new GraphQLNonNull(GraphQLID) },
    loverRequestId: { type: GraphQLID },
    userRequestId: { type: GraphQLID },
    recipientEmail: { type: new GraphQLNonNull(GraphQLEmail) },
    recipientFirstName: { type: new GraphQLNonNull(GraphQLString) },
    recipientLastName: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export default UserInviteType;
