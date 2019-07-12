import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';

import { User, UserInvite } from '../models';
import { validateJwtToken } from '../helpers';
import { sendInviteRecipientEmail } from '../../emails';
import { trackResendInvite } from '../../services/analytics';

const resendInvite = {
  type: new GraphQLObjectType({
    name: 'ResendInvite',
    fields: {},
  }),
  args: {
    userInviteId: { new: GraphQLNonNull(GraphQLID) },
    recipientEmail: { new: GraphQLNonNull(GraphQLString) },
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

    sendInviteRecipientEmail({
      sender,
      recipientEmail,
      recipientFirstName: userInvite.recipientFirstName,
      recipientLastName: userInvite.recipientLastName,
      userInviteId,
    });
    trackResendInvite(verify.id, userInviteId, recipientEmail);

    return {};
  },
};

export default resendInvite;
