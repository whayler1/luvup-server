import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
import UserType from '../types/UserType';
import { User, UserLocal } from '../models';

const createUser = {
  type: UserType,
  args: {
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  resolve: async ({ request }, { username, password, email }) => {
    const user = await User.create(
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

    // await user.createLocal({
    //   username,
    //   password,
    // })

    return user;
  },
};

export default createUser;
