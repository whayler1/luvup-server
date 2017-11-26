import graphql, { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import moment from 'moment';
import UserRequestType from '../types/UserRequestType';
import UserType from '../types/UserType';
import { UserRequest, UserLocal } from '../models';
import emailHelper from '../helpers/email';

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

    if (password.length < 8) {
      return { error: 'password too short' };
    }

    const userRequest = await UserRequest.findOne({ where: { email } });

    if (userRequest) {
      const diff = moment().diff(moment(userRequest.updatedAt), 'days');
      if (diff > 0) {
        return { error: 'expired code' };
      }
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
      try {
        await emailHelper.sendEmail({
          to: email,
          subject: 'Luvup Signup Complete!',
          html: '<p>You are now a member of Luvup!</p>',
        });
      } catch (err) {
        console.error('Error sending confirm user email', err);
      }
      return { user };
    }

    return { error: 'no user request' };
  },
};

export default confirmUser;
