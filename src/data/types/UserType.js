import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import UserLocal from './UserLocal';

const UserType = new ObjectType({
  name: 'User',
  fields: {
    id: { type: new NonNull(ID) },
    email: { type: StringType },
    local: {
      type: UserLocal,
    },
    // lover: {
    //   type: new ObjectType({
    //     name: 'Lover',
    //     fields: {
    //       id: { type: new NonNull(ID) },
    //       email: { type: StringType },
    //       local: {
    //         type: UserLocal,
    //       },
    //     },
    //   }),
    // },
  },
});

export default UserType;
