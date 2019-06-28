import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import UserInviteType from '../types/UserInviteType';
import {
  validateJwtToken,
  createRelationshipWithInvite as createRelationshipWithInviteHelper,
} from '../helpers';

import { trackCreateRelationshipWithInvite as trackAnalytics } from '../../services/analytics';
import { sendCreateRelationshipWithInviteEmails } from '../../emails';

const createRelationshipWithInvite = {
  type: new GraphQLObjectType({
    name: 'CreateRelationshipWithInvite',
    fields: {
      loverRequest: { type: LoverRequestType },
      relationship: { type: RelationshipType },
      userInvite: { type: UserInviteType },
    },
  }),
  args: {
    recipientEmail: { type: new GraphQLNonNull(GraphQLString) },
    recipientFirstName: { type: new GraphQLNonNull(GraphQLString) },
    recipientLastName: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    { request },
    { recipientEmail, recipientFirstName, recipientLastName },
  ) => {
    const verify = await validateJwtToken(request);

    const res = await createRelationshipWithInviteHelper(
      verify.id,
      recipientEmail,
      recipientFirstName,
      recipientLastName,
    );

    const { loverRequest, relationship, userInvite } = res;

    sendCreateRelationshipWithInviteEmails({
      sender: loverRequest.sender,
      recipientEmail,
      recipientFirstName,
      recipientLastName,
      userInviteId: userInvite.id,
    });
    trackAnalytics(verify.id, {
      loverRequestId: loverRequest.id,
      relationshipId: relationship.id,
      recipientEmail,
      recipientFirstName,
      recipientLastName,
      userInviteId: userInvite.id,
    });

    return res;
  },
};

export default createRelationshipWithInvite;
