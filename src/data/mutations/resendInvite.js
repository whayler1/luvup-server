import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';

import UserInviteType from '../types/UserInviteType';
import { User, UserInvite } from '../models';
import { validateJwtToken } from '../helpers';
import { sendInviteRecipientEmail } from '../../emails';
import { trackResendInvite } from '../../services/analytics';

const resendInvite = {
  type: new GraphQLObjectType({
    name: 'ResendInviteType',
    fields: {
      userInvite: { type: UserInviteType },
    },
  }),
  args: {
    userInviteId: { type: new GraphQLNonNull(GraphQLID) },
    recipientEmail: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async ({ request }, { userInviteId, recipientEmail }) => {
    const verify = await validateJwtToken(request);

    const [sender, userInvite] = await Promise.all([
      User.findById(verify.id),
      UserInvite.findById(userInviteId),
    ]);

    if (!userInvite) {
      throw new Error(`No userInvite with id ${userInviteId}`);
    }
    if (!userInvite.senderId === sender.id) {
      throw new Error('You do not have permission to resend this invite');
    }

    sendInviteRecipientEmail({
      sender,
      recipientEmail,
      recipientFirstName: userInvite.recipientFirstName,
      recipientLastName: userInvite.recipientLastName,
      userInviteId,
    });
    trackResendInvite(verify.id, userInviteId, recipientEmail);

    return { userInvite };
  },
};

export default resendInvite;
