import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
import bcrypt from 'bcrypt';
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
    const salt = await bcrypt.genSalt();
    console.log('\n\n salt ---', salt);
    const hash = await bcrypt.hash(password, salt);
    console.log('\n\nhash:', hash);

    const user = await User.create(
      {
        email,
        local: {
          username,
          password: hash,
        },
      },
      {
        include: [{ model: UserLocal, as: 'local' }],
      },
    );
    return user;
  },
};

export default createUser;
