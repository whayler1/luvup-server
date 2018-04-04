import graphql, {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
} from 'graphql';

import LoverRequestType from '../types/LoverRequestType';
import { User, LoverRequest } from '../models';
import emailHelper from '../helpers/email';
import config from '../../config';
import analytics from '../../services/analytics';

const sendEmail = (sender, recipient) =>
  emailHelper.sendEmail({
    to: recipient.email,
    subject: `You've received a lover request from ${sender.fullName} on Luvup!`,
    html: `<p>Hi ${recipient.firstName},</p><p>You have received a 💖lover💖 request from <b>${sender.fullName}</b> on Luvup! <b>Log into the Luvup app</b> to accept.</p><p><small>Email <a href="mailto:${config.supportEmail}">${config.supportEmail}</a> to flag this user.</small></p>`,
  });

const resendLoverRequestEmail = {
  type: new GraphQLObjectType({
    name: 'ResendLoverRequestEmail',
    fields: {
      success: { type: GraphQLBoolean },
      error: { type: GraphQLString },
    },
  }),
  args: {
    loverRequestId: { type: GraphQLID },
  },
  resolve: async ({ request }, { loverRequestId }) => {
    if (!('user' in request)) {
      return false;
    }

    const loverRequest = await LoverRequest.findOne({
      loverRequestId,
      UserId: request.user.id,
    });

    if (loverRequest) {
      const user = await User.find({ where: { id: request.user.id } });
      const recipient = await loverRequest.getRecipient();

      try {
        await sendEmail(user, recipient);

        analytics.track({
          userId: user.id,
          event: 'resendLoverRequestEmail',
          properties: {
            category: 'loverRequest',
            loverRequestId,
          },
        });

        return { success: true };
      } catch (err) {
        console.error('\n\nError sending request lover emails', err);
      }
    }

    return { error: 'server' };
  },
};

export default resendLoverRequestEmail;
