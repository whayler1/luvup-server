import { GraphQLString, GraphQLObjectType } from 'graphql';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import { acceptLoverRequest as sendPushNotification } from '../../services/pushNotifications';
import { sendAcceptLoverRequestEmails } from '../../emails';
import {
  acceptLoverRequestAndDuplicatePlaceholderDataForLover,
  validateJwtToken,
} from '../helpers';
import { trackAcceptLoverRequest } from '../../services/analytics';

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
      loverRequest,
      relationship,
    } = await acceptLoverRequestAndDuplicatePlaceholderDataForLover(
      verify.id,
      loverRequestId,
    );

    trackAcceptLoverRequest(user.id, sender.id, loverRequest.id);
    sendPushNotification(sender, user);
    sendAcceptLoverRequestEmails(sender, user);

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
