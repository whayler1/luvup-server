import bcrypt from 'bcrypt';
import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
import UserRequestType from '../types/UserRequestType';
import { UserRequest } from '../models';
import emailHelper from '../helpers/email';
import config from '../../config';

const getUserCode = () => String(Math.floor(Math.random() * 900000) + 100000);

const sendInviteEmail = (to, code) =>
  emailHelper.sendEmail({
    to,
    subject: 'Welcome to Luvup!',
    text: `Your create user code is ${code}.`,
    html: `<p>Your create user code is <strong>${code}</strong></p>`,
  });

const userRequest = {
  type: UserRequestType,
  args: {
    email: { type: GraphQLString },
  },
  resolve: async ({ request }, { email }) => {
    const existingUserRequest = await UserRequest.findOne({ where: { email } });

    if (existingUserRequest) {
      const user = await existingUserRequest.getUser();

      if (user) {
        return {
          email: null,
          error: 'used',
        };
      }
      const userCode = getUserCode();
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(userCode, salt);

      await existingUserRequest.update({ code: hash });

      if (config.disableEmail === 'true') {
        console.log('\n\n---\nexisting user code:', userCode);
        return {
          email,
        };
      }
      try {
        await sendInviteEmail(email, userCode);
        return {
          email,
        };
      } catch (err) {
        console.log('\n err sending email 1:', err);
        return {
          email,
          error: 'email error',
        };
      }
    }
    const userCode = getUserCode();
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(userCode, salt);

    const newUserRequest = await UserRequest.create({
      email,
      code: hash,
    });
    if (config.disableEmail === 'true') {
      console.log('\n\n---\nnew user code:', userCode);
      return {
        email,
      };
    }
    try {
      await sendInviteEmail(email, userCode);
      return {
        email,
      };
    } catch (err) {
      console.log('\n err sending email 2:', err);
      return {
        email,
        error: 'email error',
      };
    }
  },
};

export default userRequest;
