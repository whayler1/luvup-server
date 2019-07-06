import isObject from 'lodash/isObject';
import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

import { User } from '../models';
import LoverRequestType from '../types/LoverRequestType';
import RelationshipType from '../types/RelationshipType';
import UserInviteType from '../types/UserInviteType';
import {
  validateJwtToken,
  createRelationshipWithInvite as createRelationshipWithInviteHelper,
  sanitizeEmail,
} from '../helpers';

import { trackCreateRelationshipWithInvite as trackAnalytics } from '../../services/analytics';
import { sendCreateRelationshipWithInviteEmails } from '../../emails';

const throwIfEmailExists = async recipientEmail => {
  const existingUser = await User.findByEmail(recipientEmail);

  if (isObject(existingUser)) {
    throw new Error('A user with that email already exists');
  }
};

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
    {
      recipientEmail: unsanitizedRecipientEmail,
      recipientFirstName,
      recipientLastName,
    },
  ) => {
    const verify = await validateJwtToken(request);
    const recipientEmail = sanitizeEmail(unsanitizedRecipientEmail);
    await throwIfEmailExists(recipientEmail);

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
