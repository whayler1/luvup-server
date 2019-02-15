import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import bcrypt from 'bcrypt';

import { validateJwtToken } from '../helpers';
import emailHelper from '../helpers/email';
import { User, UserPasswordReset } from '../models';

const GeneratedPasswordDoesNotExistError = new Error(
  'A system password does not exist for this user.',
);
const GeneratedPasswordInvalidError = new Error(
  'System generated password invalid.',
);

const resetPasswordWithGeneratedPassword = {
  type: new GraphQLObjectType({
    name: 'ResetPasswordWithGeneratedPassword',
    fields: {
      success: { type: GraphQLBoolean },
    },
  }),
  args: {
    generatedPassword: { type: new GraphQLNonNull(GraphQLString) },
    newPassword: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async ({ request }, { generatedPassword, newPassword }) => {
    const verify = await validateJwtToken(request);

    const [userPasswordReset] = await UserPasswordReset.findAll({
      limit: 1,
      order: [[('createdAt': 'DESC')]],
      where: {
        userId: verify.id,
        isUsed: true,
      },
    });

    if (!userPasswordReset) {
      throw GeneratedPasswordDoesNotExistError;
    }
    const isMatch = await bcrypt.compare(
      generatedPassword,
      userPasswordReset.resetPassword,
    );
    if (!isMatch) {
      throw GeneratedPasswordInvalidError;
    }
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(newPassword, salt);
    const user = await User.findOne({ where: { id: verify.id } });
    await user.update({ password });
    emailHelper.sendEmail({
      to: user.email,
      subject: 'Your Luvup Password Has Been Changed',
      html: `<p>Your password has successfully been changed!</p>`,
    });
    return { success: true };
  },
};

export default resetPasswordWithGeneratedPassword;
