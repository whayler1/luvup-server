import graphql, { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import UserRequestType from '../types/UserRequestType';
import UserType from '../types/UserType';
import { UserRequest, UserLocal } from '../models';

const confirmUser = {
  type: new GraphQLObjectType({
    name: 'ConfirmUser',
    fields: {
      user: { type: UserType },
      error: { type: GraphQLString },
    },
  }),
  args: {
    email: { type: GraphQLString },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    code: { type: GraphQLInt },
  },
  resolve: async ({ request }, { email, username, password, code }) => {
    if (!email) {
      return { error: 'missing email' };
    }
    if (!password) {
      return { error: 'missing password' };
    }
    if (!username) {
      return { error: 'missing username' };
    }
    if (!code) {
      return { error: 'missing code' };
    }
    const userRequest = await UserRequest.findOne({ where: { email } });

    if (userRequest) {
      if (userRequest.code !== code) {
        return { error: 'invalid code' };
      }
      const existingUser = await userRequest.getUser();
      if (existingUser) {
        return { error: 'user request used' };
      }
      const existingUserName = await UserLocal.find({ where: { username } });
      if (existingUserName) {
        return { error: 'username taken' };
      }

      const user = await userRequest.createUser(
        {
          email,
          local: {
            username,
            password,
          },
        },
        {
          include: [{ model: UserLocal, as: 'local' }],
        },
      );
      return { user };
    }

    return { error: 'no user request' };
  },
};

export default confirmUser;
