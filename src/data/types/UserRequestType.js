import {
  GraphQLBoolean,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const UserRequest = new ObjectType({
  name: 'UserRequest',
  description:
    'Request access to the platform using your email. This will send a code to the email account that can be used with the confirmUser endpoint to create an account.',
  fields: {
    email: { type: StringType },
    error: { type: StringType },
  },
});

export default UserRequest;
