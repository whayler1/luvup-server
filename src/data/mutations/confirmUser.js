import bcrypt from 'bcrypt';
import { GraphQLObjectType, GraphQLString } from 'graphql';
import moment from 'moment';
import _ from 'lodash';
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
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    password: { type: GraphQLString },
    code: { type: GraphQLString },
  },
  resolve: async (
    { request },
    { email, username, firstName, lastName, password, code },
  ) => {
    const sanitizedEmail = _.trim(email.toLowerCase());
    const sanitizedFirstName = _.trim(_.upperFirst(firstName));
    const sanitizedLastName = _.trim(_.upperFirst(lastName));

    if (!email) {
      return { error: 'missing email' };
    }
    if (!password) {
      return { error: 'missing password' };
    }
    if (!username) {
      return { error: 'missing username' };
    }
    if (username.length < 3) {
      return { error: 'username too short' };
    }
    if (!firstName) {
      return { error: 'missing firstName' };
    }
    if (sanitizedFirstName.length < 2) {
      return { error: 'firstName too short' };
    }
    if (!lastName) {
      return { error: 'missing lastName' };
    }
    if (sanitizedLastName.length < 2) {
      return { error: 'lastName too short' };
    }
    if (!code) {
      return { error: 'missing code' };
    }

    if (password.length < 8) {
      return { error: 'password too short' };
    }

    const userRequest = await UserRequest.findOne({
      where: { email: sanitizedEmail },
    });

    if (userRequest) {
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

      const user = await userRequest.createUser({
        email: sanitizedEmail,
        emailConfirmed: true,
        username,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        fullName: `${sanitizedFirstName} ${sanitizedLastName}`,
        password: hash,
      });
      try {
        await emailHelper.sendEmail({
          to: email,
          subject: 'Luvup Signup Complete!',
          html: `<p>Congratulations <b>${sanitizedFirstName} ${sanitizedLastName}</b>. You are now a member of Luvup!</p><p>Your username is <b>${username}</b>.</p>`,
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
