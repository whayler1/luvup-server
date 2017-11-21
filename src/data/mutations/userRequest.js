import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';
import nodemailer from 'nodemailer';
import UserRequestType from '../types/UserRequestType';
import { UserRequest } from '../models';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'justin@luvup.io',
    pass: 'ifeelforyou',
  },
});

const sendInviteEmail = (to, code) =>
  new Promise((resolve, reject) => {
    const mailOptions = {
      from: 'justin@luvup.io',
      to,
      subject: 'Welcome to Luvup!',
      html: `<p>Your create user pin is <strong>${code}</strong></p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('send mail error', err);
        reject(err);
      } else {
        console.log('send mail success', info);
        resolve(info);
      }
    });
  });

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
