import {
  GraphQLBoolean,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const UserRequest = new ObjectType({
  name: 'UserRequest',
  fields: {
    email: { type: StringType },
    error: { type: StringType },
  },
});

export default UserRequest;
