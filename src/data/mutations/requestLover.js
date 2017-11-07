import graphql, { GraphQLString, GraphQLID } from 'graphql';
import LoverRequestType from '../types/LoverRequestType';
import { User, LoverRequest } from '../models';

const requestLover = {
  type: LoverRequestType,
  args: {
    recipientId: { type: GraphQLID },
  },
  resolve: async ({ request }, { recipientId }) => {
    if (!('user' in request)) {
      return false;
    }

    const user = await User.find({ id: request.user.id });
    const loverRequest = user.createLoverRequest({
      recipientId,
    });

    return loverRequest;
  },
};

export default requestLover;
