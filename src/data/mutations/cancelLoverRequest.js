import graphql, { GraphQLString, GraphQLID, GraphQLObjectType } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import moment from 'moment';

import LoverRequestType from '../types/LoverRequestType';
import { User, LoverRequest, Relationship } from '../models';
import { datetimeAndTimestamp } from '../helpers/dateFormats';
import emailHelper from '../helpers/email';

const sendEmail = (user, sender, recipient) => {
  const isUserSender = user.id === sender.id;
  let p;

  if (isUserSender) {
    p = `You canceled a lover request you sent to ${recipient.fullName}.`;
  } else {
    p = `You denied a lover request from ${sender.fullName}.`;
  }

  emailHelper.sendEmail({
    to: sender.email,
    subject: 'You canceled a lover request',
    html: `<p>Hi ${user.fullName},</p><p>${p}</p>`,
  });
};

const cancelLoverRequest = {
  type: new GraphQLObjectType({
    name: 'CancelLoverRequest',
    fields: {
      loverRequest: { type: LoverRequestType },
      error: { type: GraphQLString },
    },
  }),
  args: {
    loverRequestId: { type: GraphQLString },
  },
  resolve: async ({ request }, { loverRequestId }) => {
    console.log('\n\n-----\ncancelLoverRequest');
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
    console.log({ loverRequest });

    if (loverRequest) {
      console.log('lover request exists');
      const userId = request.user.id;
      const user = await User.findOne({ where: { id: userId } });
      console.log({ user });

      if (userId === loverRequest.UserId) {
        console.log('user is requestor');
        const lover = await User.findOne({
          where: { id: loverRequest.recipientId },
        });

        await loverRequest.update({
          isSenderCanceled: true,
        });
        sendEmail(user, user, lover);
        console.log('updated loverRequest', { loverRequest });
        return { loverRequest };
      } else if (userId === loverRequest.recipientId) {
        console.log('user is recipient');
        const lover = await User.findOne({
          where: { id: loverRequest.UserId },
        });
        sendEmail(user, lover, user);

        await loverRequest.update({
          isRecipientCanceled: true,
        });
        console.log('updated loverRequest', { loverRequest });
        return { loverRequest };
      }
    }
    return { error: 'invalid' };
  },
};

export default cancelLoverRequest;
