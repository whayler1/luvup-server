import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
// import nodemailer from 'nodemailer';
import UserRequestType from '../types/UserRequestType';
import { UserRequest } from '../models';
import emailHelper from '../helpers/email';

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
          isUsed: true,
        };
      }
      try {
        await sendInviteEmail(email, existingUserRequest.code);
        return {
          email,
          isUsed: false,
        };
      } catch (err) {
        console.log('isErrorSendingEmail 1', err);
        return {
          email,
          isUsed: false,
          isErrorSendingEmail: true,
        };
      }
    }
    const newUserRequest = await UserRequest.create({
      email,
      code: Math.floor(Math.random() * 900000) + 100000,
    });
    try {
      await sendInviteEmail(email, newUserRequest.code);
      return {
        email,
        isUsed: false,
      };
    } catch (err) {
      console.log('isErrorSendingEmail 2', err);
      return {
        email,
        isUsed: false,
        isErrorSendingEmail: true,
      };
    }
  },
};

export default userRequest;
