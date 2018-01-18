import { GraphQLInt, GraphQLObjectType, GraphQLList as List } from 'graphql';
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
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token) {
      return {};
    }

    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.find({ where: { id: verify.id } });
      console.log('\n\nuser', user);
      const loverRequest = await LoverRequest.findOne({
        where: { UserId: user.id },
      });
      console.log('\n\nloverRequst', loverRequest);

      if (loverRequest && !loverRequest.isActive) {
        const recipient = await loverRequest.getRecipient();
        return {
          loverRequest: Object.assign({}, loverRequest.dataValues, {
            recipient: recipient.dataValues,
          }),
        };
      }
      return {};
    }
    return {};
  },
};

export default activeLoverRequest;
