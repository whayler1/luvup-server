import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLList,
} from 'graphql';

const UserType = new ObjectType({
  name: 'User',
  fields: {
    id: { type: new NonNull(ID) },
    email: { type: StringType },
    username: { type: StringType },
    firstName: { type: StringType },
    lastName: { type: StringType },
    relationship: {
      type: new ObjectType({
        name: 'Relationship',
        fields: {
          id: { type: new NonNull(ID) },
          createdAt: { type: StringType },
          lovers: {
            type: new GraphQLList(
              new ObjectType({
                name: 'Lover',
                fields: {
                  id: { type: new NonNull(ID) },
                  email: { type: StringType },
                  username: { type: StringType },
                  firstName: { type: StringType },
                  lastName: { type: StringType },
                },
              }),
            ),
          },
        },
      }),
    },
  },
});

export default UserType;
