import { GraphQLObjectType, GraphQLNonNull, GraphQLID } from 'graphql';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import { LoverRequest } from '../models';
import { validateJwtToken } from '../helpers';
import { createLoverRequestAndRelationshipAndPlaceholderLover as sendPushNotifications } from '../../services/pushNotifications';
import { trackCreateLoverRequestAndRelationshipAndPlaceholderLover as trackAnalytics } from '../../services/analytics';
import { sendLoverRequestSentEmails } from '../../emails';

const createLoverRequestAndRelationshipAndPlaceholderLover = {
  type: new GraphQLObjectType({
    name: 'CreateLoverRequestAndRelationshipAndPlaceholderLover',
    fields: {
      loverRequest: { type: LoverRequestType },
      relationship: { type: RelationshipType },
    },
  }),
  args: {
    recipientId: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async ({ request }, { recipientId }) => {
    const verify = await validateJwtToken(request);

    const res = await LoverRequest.createAndAddRelationshipAndPlaceholderLover(
      verify.id,
      recipientId,
    );

    const { loverRequest: { sender, recipient } } = res;

    sendPushNotifications(sender, recipient);
    sendLoverRequestSentEmails(sender, recipient);
    trackAnalytics(
      sender.id,
      recipient.id,
      res.loverRequest.id,
      res.relationship.id,
    );

    return res;
  },
};

export default createLoverRequestAndRelationshipAndPlaceholderLover;
