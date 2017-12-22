import bcrypt from 'bcrypt';
import passgen from 'pass-gen';
import graphql, {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';
import moment from 'moment';
import UserRequestType from '../types/UserRequestType';
import UserType from '../types/UserType';
import { UserRequest, UserPasswordReset, UserLocal, User } from '../models';
import emailHelper from '../helpers/email';

const sendNewPassword = {
  type: new GraphQLObjectType({
    name: 'SendNewPassword',
    fields: {
      success: {
        type: GraphQLBoolean,
        defaultValue: false,
      },
      error: { type: GraphQLString },
    },
  }),
  args: {
    email: { type: GraphQLString },
  },
  resolve: async ({ request }, { email }) => {
    if (!email) {
      return { error: 'no email' };
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return { error: 'invalid email' };
    }

    const resetPassword = passgen({
      ascii: true,
      ASCII: true,
      numbers: true,
      length: 8,
    });

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(resetPassword, salt);

    const userPasswordReset = await user.getUserPasswordReset();

    if (userPasswordReset) {
      await userPasswordReset.update({
        isUsed: false,
        resetPassword: hash,
      });
    } else {
      await user.createUserPasswordReset({
        resetPassword: hash,
      });
    }

    try {
      await emailHelper.sendEmail({
        to: email,
        subject: 'Luvup Password Reset',
        html: `<p>This is your temporary password: <b>${resetPassword}</b></p>`,
      });
    } catch (err) {
      console.error('Error sending confirm user email', err);
      return { error: 'error sending email' };
    }

    return { success: true };
  },
};

export default sendNewPassword;
