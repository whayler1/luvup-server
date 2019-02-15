import bcrypt from 'bcrypt';
import passgen from 'pass-gen';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
} from 'graphql';

import { User } from '../models';
import emailHelper from '../helpers/email';

const NoUserWithThatEmailError = new Error('No user found with that email');

const sendNewPassword = {
  type: new GraphQLObjectType({
    name: 'SendNewPassword',
    fields: {
      success: {
        type: GraphQLBoolean,
        defaultValue: false,
      },
    },
  }),
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async ({ request }, { email }) => {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      throw NoUserWithThatEmailError;
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

    await emailHelper.sendEmail({
      to: email,
      subject: 'Luvup Password Reset',
      html: `<p>Your temporary password is: <b>${resetPassword}</b></p><p>Log in with this password to reset your password. You will be prompted to set a new password after.</p>`,
    });

    return { success: true };
  },
};

export default sendNewPassword;
