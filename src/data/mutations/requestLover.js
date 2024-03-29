import { GraphQLID, GraphQLObjectType } from 'graphql';
import uuid from 'uuid/v1';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import { User, UserRequest, Relationship } from '../models';
import emailHelper from '../helpers/email';
import config from '../../config';
import analytics from '../../services/analytics';
import { validateJwtToken } from '../helpers';
import { UserNotLoggedInError } from '../errors';
import { sendPushNotification } from '../../services/pushNotifications';

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
  type: new GraphQLObjectType({
    name: 'RequestLover',
    fields: {
      loverRequest: { type: LoverRequestType },
      relationship: { type: RelationshipType },
    },
  }),
  args: {
    recipientId: { type: GraphQLID },
  },
  resolve: async ({ request }, { recipientId }) => {
    const verify = await validateJwtToken(request);

    if (!verify) {
      throw UserNotLoggedInError;
    }

    const user = await User.find({ where: { id: verify.id } });
    const recipient = await User.find({ where: { id: recipientId } });

    const loverRequest = await user.createLoverRequest();
    await loverRequest.setRecipient(recipient);

    const relationship = await Relationship.create();
    await relationship.addLover(user);
    const placeholderLoverId = uuid();
    const placeholderUserRequest = await UserRequest.create({
      email: recipient.email,
      code: 'placholder',
    });
    const placeholderLover = await placeholderUserRequest.createUser({
      id: placeholderLoverId,
      email: recipient.email,
      isPlaceholder: true,
      username: placeholderLoverId,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      fullName: recipient.fullName,
      password: placeholderLoverId,
    });
    await relationship.addLover(placeholderLover);
    await user.setRelationship(relationship);
    await placeholderLover.setRelationship(relationship);

    analytics.track({
      userId: user.id,
      event: 'requestLover',
      properties: {
        category: 'loverRequest',
        recipientId,
        loverRequestId: loverRequest.id,
      },
    });

    sendPushNotification(
      recipient.id,
      `${user.fullName} has requested you as a lover!`,
      {
        type: 'lover-request-received',
      },
    );

    try {
      await sendEmails(user, recipient);
    } catch (err) {
      console.error('\n\nError sending request lover emails', err);
    }

    return {
      loverRequest: {
        ...loverRequest.dataValues,
        sender: user.dataValues,
        recipient: recipient.dataValues,
      },
      relationship: {
        ...relationship.dataValues,
        lovers: [placeholderLover],
      },
    };
  },
};

export default requestLover;
