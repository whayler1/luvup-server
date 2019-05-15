import { GraphQLObjectType } from 'graphql';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
// import analytics from '../../services/analytics';
import { validateJwtToken } from '../helpers';
import { UserNotLoggedInError } from '../errors';
import { LoverRequest, User } from '../models';

const NoLoverRequestSentError = new Error(
  'You do not have any sent lover requests',
);

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

    if (!verify) {
      throw UserNotLoggedInError;
    }

    const loverRequest = await LoverRequest.find({
      where: {
        senderId: verify.id,
        isAccepted: false,
        isSenderCanceled: false,
        isRecipientCanceled: false,
      },
    });

    if (!loverRequest) {
      throw NoLoverRequestSentError;
    }

    const user = await User.find({ where: { id: verify.id } });
    const relationship = await user.getRelationship();
  },
};

export default cancelSentLoverRequestAndRelationship;
