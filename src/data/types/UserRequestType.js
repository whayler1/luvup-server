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
    isUsed: { type: GraphQLBoolean },
    isErrorSendingEmail: { type: GraphQLBoolean },
  },
});

export default UserRequest;
