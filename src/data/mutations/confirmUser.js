import bcrypt from 'bcrypt';
import graphql, { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import moment from 'moment';
import UserRequestType from '../types/UserRequestType';
import UserType from '../types/UserType';
import { User, UserRequest } from '../models';
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
    code: { type: GraphQLString },
  },
  resolve: async ({ request }, { email, username, password, code }) => {
    console.log('\n\nconfirmUser');
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
      console.log('\n\nuserRequest exists');
      const diff = moment().diff(moment(userRequest.updatedAt), 'days');
      if (diff > 0) {
        return { error: 'expired code' };
      }

      const isCodeMatch = await bcrypt.compare(code, userRequest.code);
      if (!isCodeMatch) {
        return { error: 'invalid code' };
      }
      const existingUser = await userRequest.getUser();
      if (existingUser) {
        return { error: 'user request used' };
      }
      const existingUserName = await User.find({ where: { username } });
      if (existingUserName) {
        return { error: 'username taken' };
      }

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      console.log('\n\ngot to after hash');

      const user = await userRequest.createUser({
        email,
        emailConfirmed: true,
        username,
        password: hash,
      });
      try {
        await emailHelper.sendEmail({
          to: email,
          subject: 'Luvup Signup Complete!',
          html: '<p>You are now a member of Luvup!</p>',
        });
      } catch (err) {
        console.error('\n\nError sending confirm user email', err);
      }
      return { user };
    }

    return { error: 'no user request' };
  },
};

export default confirmUser;
