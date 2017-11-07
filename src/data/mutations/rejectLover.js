import graphql, { GraphQLString, GraphQLID } from 'graphql';
import LoverRequestType from '../types/LoverRequestType';
import { User } from '../models';

const rejectLover = {
  type: LoverRequestType,
  resolve: async ({ request }) => {
    if (!('user' in request)) {
      return false;
    }

    const user = await User.find({ id: request.user.id });
    const loverRequest = await user.getLoverRequest();
    await loverRequest.update({ isAccepted: false });
    // JW: Maybe disassociate love request?
    await user.setLover(null);

    return loverRequest;
  },
};

export default rejectLover;
