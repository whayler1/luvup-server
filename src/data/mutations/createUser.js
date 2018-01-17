import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import UserType from '../types/UserType';
import { User } from '../models';

const createUser = {
  type: UserType,
  args: {
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  resolve: async ({ request }, { username, password, email }) => {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      username,
      password: hash,
    });
    return user;
  },
};

export default createUser;
