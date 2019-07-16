import { GraphQLObjectType, GraphQLNonNull, GraphQLID } from 'graphql';

import UserInviteType from '../types/UserInviteType';
import UserType from '../types/UserType';
import { User, UserInvite } from '../models';

const userInviteWithId = {
  type: new GraphQLObjectType({
    name: 'UserInviteWithIdResource',
    description: 'reaturns the user invite with the specified id',
    fields: {
      userInvite: { type: UserInviteType },
      sender: { type: UserType },
    },
  }),
  args: {
    userInviteId: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (_, { userInviteId }) => {
    const userInvite = await UserInvite.findById(userInviteId);
    if (!userInvite) {
      throw new Error(`User invite with id ${userInviteId} does not exist`);
    }
    const sender = await User.findById(userInvite.senderId);
    return { userInvite, sender };
  },
};

export default userInviteWithId;
