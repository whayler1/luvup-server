import { GraphQLObjectType, GraphQLString } from 'graphql';

const UserRequest = new GraphQLObjectType({
  name: 'UserRequest',
  description:
    'Request access to the platform using your email. This will send a code to the email account that can be used with the confirmUser endpoint to create an account.',
  fields: {
    email: { type: GraphQLString },
  },
});

export default UserRequest;
