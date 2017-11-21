import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
import UserRequestType from '../types/UserRequestType';
import { UserRequest } from '../models';

const userRequest = {
  type: UserRequestType,
  args: {
    email: { type: GraphQLString },
  },
  resolve: async ({ request }, { email }) => {
    const existingUserRequest = await UserRequest.find({ email });

    if (existingUserRequest) {
      const user = await existingUserRequest.getUser();

      if (user) {
        return {
          email: null,
          isUsed: true,
        };
      }
      return {
        email,
        isUsed: false,
      };
    }
    await UserRequest.create({
      email,
      code: Math.floor(Math.random() * 900000) + 100000,
    });
    return {
      email,
      isUsed: false,
    };
  },
};

export default userRequest;
