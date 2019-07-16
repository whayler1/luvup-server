import { GraphQLObjectType } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User, LoverRequest } from '../models';
import LoverRequestType from '../types/LoverRequestType';
import config from '../../config';

const activeLoverRequest = {
  type: new GraphQLObjectType({
    name: 'ActiveLoverRequestResource',
    fields: {
      loverRequest: { type: LoverRequestType },
    },
  }),
  resolve: async ({ request }) => {
    const id_token = _.get(request, 'cookies.id_token');
    if (!id_token) {
      return {};
    }

    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.find({ where: { id: verify.id } });
      const loverRequest = await LoverRequest.findOne({
        where: { UserId: user.id },
        order: [['createdAt', 'DESC']],
      });

      if (
        loverRequest &&
        !loverRequest.isAccepted &&
        !loverRequest.isRecipientCanceled &&
        !loverRequest.isSenderCanceled
      ) {
        const recipient = await loverRequest.getRecipient();
        return {
          loverRequest: Object.assign({}, loverRequest.dataValues, {
            recipient: _.get(recipient, 'dataValues', {}),
          }),
        };
      }
      return {};
    }
    return {};
  },
};

export default activeLoverRequest;
