import bcrypt from 'bcrypt';
import graphql, {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';
import moment from 'moment';
import UserRequestType from '../types/UserRequestType';
import UserType from '../types/UserType';
import { UserRequest, UserLocal, User } from '../models';
import emailHelper from '../helpers/email';

const resetPassword = {
  type: new GraphQLObjectType({
    name: 'ResetPassword',
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
    oldPassword: { type: GraphQLString },
    newPassword: { type: GraphQLString },
  },
  resolve: async ({ request }, { email, oldPassword, newPassword }) => {
    if (!email) {
      return { error: 'no email' };
    }
    if (!oldPassword) {
      return { error: 'no old password' };
    }
    if (!newPassword) {
      return { error: 'no new password' };
    }

    let user = await User.findOne({ where: { email } });
    let userLocal;

    if (!user) {
      userLocal = await UserLocal.find({ where: { username: email } });

      if (!userLocal) {
        return { error: 'invalid email' };
      }
      user = await User.findOne({ where: { id: userLocal.userId } });
    }

    if (!userLocal) {
      userLocal = await user.getLocal();
    }

    if (!userLocal) {
      return { error: 'no local user' };
    }

    const isPwordMatch = await bcrypt.compare(oldPassword, userLocal.password);

    if (!isPwordMatch) {
      const userPasswordReset = await user.getUserPasswordReset();
      if (!userPasswordReset) {
        return { error: 'no reset password' };
      }

      const isPwordResetMatch = await bcrypt.compare(
        oldPassword,
        userPasswordReset.resetPassword,
      );
      if (!isPwordResetMatch || userPasswordReset.isUsed) {
        return { error: 'password error' };
      }
      await userPasswordReset.update({ isUsed: true });
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(newPassword, salt);

    await userLocal.update({ password: hash });

    try {
      await emailHelper.sendEmail({
        to: email,
        subject: 'Your Luvup Password Has Been Reset',
        html: `<p>Your Luvup password has been reset. If this password was not reset by you please contact <a href="mailto:justin@luvup.io">justin@luvup.io</a>.</p>`,
      });
    } catch (err) {
      return {
        success: true,
        error: 'error sending email',
      };
    }

    return { success: true };
  },
};

export default resetPassword;
