import graphql, { GraphQLString, GraphQLID, GraphQLObjectType } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import moment from 'moment';

import LoverRequestType from '../types/LoverRequestType';
import { User, LoverRequest, Relationship } from '../models';
import { datetimeAndTimestamp } from '../helpers/dateFormats';
import emailHelper from '../helpers/email';

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
      error: { type: GraphQLString },
    },
  }),
  args: {
    loverRequestId: { type: GraphQLString },
  },
  resolve: async ({ request }, { loverRequestId }) => {
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token || !loverRequestId || !('user' in request)) {
      return {};
    }

    const loverRequest = await LoverRequest.findOne({
      where: {
        id: loverRequestId,
        isAccepted: false,
        isSenderCanceled: false,
        isRecipientCanceled: false,
      },
    });

    if (loverRequest) {
      const user = await User.findOne({ where: { id: request.user.id } });
      const recipient = await loverRequest.getRecipient();
      if (recipient.id !== user.id) {
        return { error: 'recipient id does not match' };
      }

      const lover = await User.findOne({ where: { id: loverRequest.UserId } });
      if (!lover) {
        return { error: 'lover invalid' };
      }

      /**
       * If either user is already in a relationship we have to set end date.
       */
      const userRelationship = await user.getRelationship();
      const loverRelationship = await lover.getRelationship();
      const endDate = datetimeAndTimestamp(moment());
      if (userRelationship) {
        userRelationship.update({ endDate });
      }
      if (loverRelationship) {
        loverRelationship.update({ endDate });
      }

      const relationship = await Relationship.create();
      await relationship.addLover(user);
      await relationship.addLover(lover);
      await user.setRelationship(relationship);
      await lover.setRelationship(relationship);

      await loverRequest.update({
        isAccepted: true,
      });

      try {
        await sendEmails(lover, user);
      } catch (err) {
        console.log('error sending acceptLoverRequest emails!', err);
      }
      return { loverRequest };
    }
    return { error: 'invalid' };
  },
};

export default acceptLoverRequest;