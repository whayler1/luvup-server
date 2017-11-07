/**
 * figure out how to return just like 200 ok or equivilent
 */

import graphql, { GraphQLString, GraphQLID } from 'graphql';
import LoverRequestType from '../types/LoverRequestType';
import { User, LoverRequest } from '../models';

const removeLover = {
  // type: LoverRequestType,
  resolve: async ({ request }) => {
    if (!('user' in request)) {
      return false;
    }

    const user = await User.find({ id: request.user.id });
    // user.deleteLover
    // const loverRequest = await user.getLoverRequest();
    // await loverRequest.update({ isAccepted: true });
    // const lover = await User.find({ id: loverRequest.recipientId });
    // user.setLover(lover);

    return {};
  },
};

export default removeLover;
