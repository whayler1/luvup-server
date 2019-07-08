import { GraphQLObjectType } from 'graphql';

import { validateJwtToken } from '../helpers';
import UserInviteType from '../types/UserInviteType';
import { User, UserInvite } from '../models';

const userInvite = {
  type: new GraphQLObjectType({
    name: 'UserInviteResource',
    description: 'returns a user invite if there is one currently pending',
    fields: {
      userInvite: { type: UserInviteType },
    },
  }),
  resolve: async ({ request }) => {
    const verify = await validateJwtToken(request);
    const user = await User.findById(verify.id);

    if (!user.RelationshipId) {
      throw new Error('User is not in relationship');
    }

    const userInviteInstance = await UserInvite.findWithSenderAndRelationship(
      user.RelationshipId,
      user.id,
    );

    return { userInvite: userInviteInstance };
  },
};

export default userInvite;
