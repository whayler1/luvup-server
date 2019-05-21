import { GraphQLObjectType, GraphQLNonNull, GraphQLID } from 'graphql';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import { LoverRequest } from '../models';
import { validateJwtToken } from '../helpers';
import { createLoverRequestAndRelationshipWithPlaceholderLover as sendPushNotifications } from '../../services/pushNotifications';

const createLoverRequestAndRelationshipWithPlaceholderLover = {
  type: new GraphQLObjectType({
    name: 'CreateLoverRequestAndRelationshipWithPlaceholderLover',
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

    return res;
  },
};

export default createLoverRequestAndRelationshipWithPlaceholderLover;
