import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const UserLocal = new ObjectType({
  name: 'UserLocal',
  fields: {
    username: { type: StringType },
  },
});

export default UserLocal;
