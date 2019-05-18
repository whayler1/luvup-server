import { GraphQLObjectType } from 'graphql';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import { validateJwtToken } from '../helpers';
import { LoverRequest } from '../models';
import { sendLoverRequestCanceledEmail } from '../../emails';

const getUserFromLoverById = (userId, lovers) =>
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
      relationhip,
      lovers,
    } = await LoverRequest.cancelBySenderId(verify.id);

    sendLoverRequestCanceledEmail(
      getUserFromLoverById(verify.id, lovers),
      getUserFromLoverById(loverRequest.recipientId, lovers),
    );

    return {
      loverRequest,
      relationhip,
    };
  },
};

export default cancelSentLoverRequestAndRelationship;
