import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
import UserRequestType from '../types/UserRequestType';
import { UserRequest } from '../models';
import emailHelper from '../helpers/email';

const getUserCode = () => Math.floor(Math.random() * 900000) + 100000;

const sendInviteEmail = (to, code) =>
  emailHelper.sendEmail({
    to,
    subject: 'Welcome to Luvup!',
    html: `<p>Your create user pin is <strong>${code}</strong></p>`,
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
      await existingUserRequest.update({ code: getUserCode() });
      if (process.env.DISABLE_EMAIL === 'true') {
        console.log('\n\n---\nexisting user code:', existingUserRequest.code);
        return {
          email,
        };
      }
      try {
        await sendInviteEmail(email, existingUserRequest.code);
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
    const code = getUserCode();
    const newUserRequest = await UserRequest.create({
      email,
      code,
    });
    if (process.env.DISABLE_EMAIL === 'true') {
      console.log('\n\n---\nnew user code:', code);
      return {
        email,
      };
    }
    try {
      await sendInviteEmail(email, newUserRequest.code);
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
