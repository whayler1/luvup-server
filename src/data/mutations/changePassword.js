import bcrypt from 'bcrypt';
import { GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql';
import _ from 'lodash';
import jwt from 'jsonwebtoken';

import { User } from '../models';
import emailHelper from '../helpers/email';
import config from '../../config';
import analytics from '../../services/analytics';

const sendEmail = async (email, firstName, lastName) => {
  try {
    await emailHelper.sendEmail({
      to: email,
      subject: 'Luvup Password Changed',
      html: `<p>Hi ${firstName} ${lastName},</p><p>Your password has been changed on Luvup. If this was not you please email <a href="mailto:justin@luvup.io">justin@luvup.io</a>.</p>`,
    });
  } catch (err) {
    console.error('\n\nError sending change password email', err);
  }
};

const changePassword = {
  type: new GraphQLObjectType({
    name: 'ChangePassword',
    fields: {
      success: { type: GraphQLBoolean },
      error: { type: GraphQLString },
    },
  }),
  args: {
    currentPassword: { type: GraphQLString },
    newPassword: { type: GraphQLString },
  },
  resolve: async ({ request }, { currentPassword, newPassword }) => {
    if (!currentPassword) {
      return { error: 'no-current-password' };
    }
    if (!newPassword) {
      return { error: 'invalid-password' };
    }
    if (newPassword.length < 8) {
      return { error: 'new-password-short' };
    }

    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token) {
      return {};
    }
    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.findOne({ where: { id: verify.id } });
      const isPwordMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isPwordMatch) {
        return { error: 'invalid-password' };
      }

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(newPassword, salt);

      await user.update({
        password: hash,
      });

      await user.createUserEvent({
        relationshipId: user.RelationshipId,
        name: 'password-changed',
      });

      sendEmail(user.email, user.firstName, user.lastName);

      analytics.track({
        userId: user.id,
        event: 'changePassword',
        properties: {
          category: 'user',
        },
      });

      return { success: true };
    }
    return {};
  },
};

export default changePassword;
