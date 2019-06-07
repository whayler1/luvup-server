import { GraphQLString, GraphQLObjectType } from 'graphql';
// import moment from 'moment';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import { acceptLoverRequest as sendPushNotification } from '../../services/pushNotifications';
// import { User, LoverRequest, Relationship } from '../models';
// import { datetimeAndTimestamp } from '../helpers/dateFormats';
import {
  emailHelper,
  acceptLoverRequestAndDuplicatePlaceholderDataForLover,
  validateJwtToken,
} from '../helpers';
import analytics from '../../services/analytics';
// import { sendPushNotification } from '../../services/pushNotifications';
// import { LoverRequestNotFoundError } from '../errors';

const sendEmails = (sender, recipient) => {
  const senderEmail = emailHelper.sendEmail({
    to: sender.email,
    subject: 'You have been accepted by a new lover!',
    html: `<p>Hi ${sender.fullName},</p><p>Congratulations, <b>${recipient.fullName}</b> has accepted your lover request on Luvup!</p>`,
  });
  const recipientEmail = emailHelper.sendEmail({
    to: recipient.email,
    subject: 'You have accepted a new lover!',
    html: `<p>Hi ${recipient.fullName},</p><p>Congratulations, you have accepted <b>${sender.fullName}</b> as your new lover on Luvup!</p>`,
  });

  return Promise.all([senderEmail, recipientEmail]);
};

const acceptLoverRequest = {
  type: new GraphQLObjectType({
    name: 'AcceptLoverRequest',
    fields: {
      loverRequest: { type: LoverRequestType },
      relationship: { type: RelationshipType },
      error: { type: GraphQLString },
    },
  }),
  args: {
    loverRequestId: { type: GraphQLString },
  },
  resolve: async ({ request }, { loverRequestId }) => {
    const verify = await validateJwtToken(request);

    const {
      user,
      sender,
      // placeholderLover,
      loverRequest,
      relationship,
    } = await acceptLoverRequestAndDuplicatePlaceholderDataForLover(
      verify.id,
      loverRequestId,
    );

    analytics.track({
      userId: user.id,
      event: 'acceptLoverRequest',
      properties: {
        category: 'loverRequest',
        loverRequestId,
        senderId: sender.id,
      },
    });

    sendPushNotification(sender, user);

    try {
      await sendEmails(sender, user);
    } catch (err) {
      console.error('error sending acceptLoverRequest email');
    }
    return {
      loverRequest,
      relationship: {
        ...relationship.dataValues,
        lovers: [sender.dataValues],
      },
    };
  },
};

export default acceptLoverRequest;
