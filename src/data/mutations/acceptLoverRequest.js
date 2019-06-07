import { GraphQLString, GraphQLObjectType } from 'graphql';
// import moment from 'moment';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
// import { User, LoverRequest, Relationship } from '../models';
// import { datetimeAndTimestamp } from '../helpers/dateFormats';
import {
  emailHelper,
  acceptLoverRequestAndDuplicatePlaceholderDataForLover,
  validateJwtToken,
} from '../helpers';
import { generateScore } from '../helpers/relationshipScore';
import analytics from '../../services/analytics';
import { sendPushNotification } from '../../services/pushNotifications';
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

    // const loverRequest = await LoverRequest.findOne({
    //   where: {
    //     id: loverRequestId,
    //     isAccepted: false,
    //     isSenderCanceled: false,
    //     isRecipientCanceled: false,
    //   },
    // });
    //
    // if (!loverRequest) {
    //   throw LoverRequestNotFoundError;
    // }
    //
    // const user = await User.findById(verify.id);
    // const recipient = await loverRequest.getRecipient();
    // if (recipient.id !== user.id) {
    //   return { error: 'recipient id does not match' };
    // }
    //
    // const lover = await User.findOne({ where: { id: loverRequest.UserId } });
    // if (!lover) {
    //   return { error: 'lover invalid' };
    // }
    // /**
    //    * If either user is already in a relationship we have to set end date.
    //    */
    // const userRelationship = await user.getRelationship();
    // const loverRelationship = await lover.getRelationship();
    // const endDate = datetimeAndTimestamp(moment());
    //
    // if (userRelationship) {
    //   userRelationship.update({ endDate });
    // }
    // if (loverRelationship) {
    //   loverRelationship.update({ endDate });
    // }
    //
    // const relationship = await Relationship.create();
    // await relationship.addLover(user);
    // await relationship.addLover(lover);
    // await user.setRelationship(relationship);
    // await lover.setRelationship(relationship);
    //
    // await loverRequest.update({
    //   isAccepted: true,
    // });
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

    /**
       * JW: Generate initial relationship score as soon as relationship is created.
       */
    await generateScore(user);
    await generateScore(sender);

    analytics.track({
      userId: user.id,
      event: 'acceptLoverRequest',
      properties: {
        category: 'loverRequest',
        loverRequestId,
        senderId: sender.id,
      },
    });

    sendPushNotification(
      sender.id,
      `${user.fullName} has accepted your lover request! 💞`,
      {
        type: 'lover-request-accepted',
      },
    );

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
