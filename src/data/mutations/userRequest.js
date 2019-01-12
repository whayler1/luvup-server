import bcrypt from 'bcrypt';
import { GraphQLString } from 'graphql';
import UserRequestType from '../types/UserRequestType';
import { UserRequest } from '../models';
import emailHelper from '../helpers/email';
import config from '../../config';

const getIsAdminTestRequest = email => /^justin\+.*?@luvup.io$/i.test(email);
const SendEmailError = new Error('Error sending confirmation email');
const EmailExistsError = new Error('There is already a user with this email');

const getUserCode = email =>
  getIsAdminTestRequest(email)
    ? '012345'
    : String(Math.floor(Math.random() * 900000) + 100000);

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
    // throw EmailExistsError;
    const existingUserRequest = await UserRequest.findOne({ where: { email } });

    if (existingUserRequest) {
      const user = await existingUserRequest.getUser();

      if (user) {
        throw EmailExistsError;
      }
      const userCode = getUserCode(email);
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(userCode, salt);

      await existingUserRequest.update({ code: hash });

      if (config.disableEmail === 'true') {
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
        throw SendEmailError;
      }
    }
    const userCode = getUserCode(email);
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(userCode, salt);

    await UserRequest.create({
      email,
      code: hash,
    });
    if (config.disableEmail === 'true') {
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
      throw SendEmailError;
    }
  },
};

export default userRequest;
