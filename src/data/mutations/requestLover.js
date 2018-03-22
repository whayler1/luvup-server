import graphql, { GraphQLString, GraphQLID } from 'graphql';
import _ from 'lodash';

import LoverRequestType from '../types/LoverRequestType';
import { User, LoverRequest } from '../models';
import emailHelper from '../helpers/email';
import config from '../../config';

const sendEmails = (sender, recipient) => {
  const senderEmail = emailHelper.sendEmail({
    to: sender.email,
    subject: `Luvup lover request sent to ${recipient.fullName}`,
    html: `<p>Hi ${sender.firstName},</p><p>Your 💖lover💖 request has been sent to <b>${recipient.fullName}</b>! We'll let you know when they accept 😉.</p>`,
  });
  const recipientEmail = emailHelper.sendEmail({
    to: recipient.email,
    subject: `You've received a lover request from ${sender.fullName} on Luvup!`,
    html: `<p>Hi ${recipient.firstName},</p><p>You have received a 💖lover💖 request from <b>${sender.fullName}</b> on Luvup! <b>Log into the Luvup app</b> to accept.</p><p><small>Email <a href="mailto:${config.supportEmail}">${config.supportEmail}</a> to flag this user.</small></p>`,
  });

  return Promise.all([senderEmail, recipientEmail]);
};

const requestLover = {
  type: LoverRequestType,
  args: {
    recipientId: { type: GraphQLID },
  },
  resolve: async ({ request }, { recipientId }) => {
    if (!('user' in request)) {
      return false;
    }

    const user = await User.find({ where: { id: request.user.id } });
    const recipient = await User.find({ where: { id: recipientId } });

    const loverRequest = await user.createLoverRequest();
    await loverRequest.setRecipient(recipient);

    try {
      await sendEmails(user, recipient);
    } catch (err) {
      console.error('\n\nError sending request lover emails', err);
    }

    return Object.assign({}, loverRequest.dataValues, {
      recipient: recipient.dataValues,
    });
  },
};

export default requestLover;
