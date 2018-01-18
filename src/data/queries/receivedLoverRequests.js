import { GraphQLInt, GraphQLObjectType, GraphQLList } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User, LoverRequest } from '../models';
import LoverRequestType from '../types/LoverRequestType';
import config from '../../config';

const addSenders = loverRequests =>
  Promise.all(
    loverRequests.rows.map(loverRequest =>
      User.findOne({ where: { id: loverRequest.UserId } }),
    ),
  ).then(senders =>
    loverRequests.rows.map((loverRequest, index) =>
      Object.assign({}, loverRequest.dataValues, {
        sender: senders[index].dataValues,
      }),
    ),
  );

const receivedLoverRequests = {
  type: new GraphQLObjectType({
    name: 'ReceivedLoverRequestsResource',
    fields: {
      rows: { type: new GraphQLList(LoverRequestType) },
      count: { type: GraphQLInt },
    },
  }),
  resolve: async ({ request }) => {
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token) {
      return {};
    }

    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const loverRequests = await LoverRequest.findAndCountAll({
        where: {
          recipientId: verify.id,
          isAccepted: false,
          isRecipientCanceled: false,
          isSenderCanceled: false,
        },
        order: [['createdAt', 'DESC']],
      });

      const rows = await addSenders(loverRequests);

      if (loverRequests) {
        return Object.assign({}, loverRequests.dataValues, { rows });
      }
      return {};
    }
    return {};
  },
};

export default receivedLoverRequests;
