import { GraphQLObjectType, GraphQLNonNull, GraphQLID } from 'graphql';

import UserInviteType from '../types/UserInviteType';
import UserType from '../types/UserType';
import LoverRequestType from '../types/LoverRequestType';
import { User, LoverRequest, UserInvite } from '../models';

const userInviteWithId = {
  type: new GraphQLObjectType({
    name: 'UserInviteWithIdResource',
    description: 'reaturns the user invite with the specified id',
    fields: {
      userInvite: { type: UserInviteType },
      sender: { type: UserType },
      loverRequest: { type: LoverRequestType },
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
    const [sender, loverRequest] = await Promise.all([
      User.findById(userInvite.senderId),
      LoverRequest.findById(userInvite.loverRequestId),
    ]);
    return { userInvite, sender, loverRequest };
  },
};

export default userInviteWithId;
