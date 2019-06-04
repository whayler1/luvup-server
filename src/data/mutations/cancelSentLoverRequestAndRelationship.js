import { GraphQLObjectType } from 'graphql';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import { validateJwtToken } from '../helpers';
import { LoverRequest, User } from '../models';
import { sendLoverRequestCanceledEmail } from '../../emails';
import { trackCancelSentLoverRequestAndRelationship } from '../../services/analytics';

const getUserFromLoversById = (userId, lovers) =>
  lovers.find(lover => lover.id === userId);

const cancelSentLoverRequestAndRelationship = {
  type: new GraphQLObjectType({
    name: 'CancelSentLoverRequestAndRelationship',
    fields: {
      loverRequest: { type: LoverRequestType },
      relationship: { type: RelationshipType },
    },
  }),
  resolve: async ({ request }) => {
    const verify = await validateJwtToken(request);

    const {
      loverRequest,
      relationship,
      lovers,
    } = await LoverRequest.cancelBySenderId(verify.id);

    const recipient = await User.findById(loverRequest.recipientId);

    sendLoverRequestCanceledEmail(
      getUserFromLoversById(verify.id, lovers),
      recipient,
    );

    trackCancelSentLoverRequestAndRelationship(
      verify.id,
      loverRequest.id,
      relationship.id,
    );

    return {
      loverRequest,
      relationship: {
        ...relationship.dataValues,
        lovers,
      },
    };
  },
};

export default cancelSentLoverRequestAndRelationship;
