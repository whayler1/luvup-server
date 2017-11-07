import graphql, { GraphQLString, GraphQLID } from 'graphql';
import LoverRequestType from '../types/LoverRequestType';
import { User, LoverRequest } from '../models';

const acceptLover = {
  type: LoverRequestType,
  resolve: async ({ request }) => {
    if (!('user' in request)) {
      return false;
    }

    const user = await User.find({ id: request.user.id });
    const loverRequest = await user.getLoverRequest();
    await loverRequest.update({ isAccepted: true });
    const lover = await User.find({ id: loverRequest.recipientId });
    user.addLover(lover);

    return loverRequest;
  },
};

export default acceptLover;
