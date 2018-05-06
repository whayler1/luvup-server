import graphql, {
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLObjectType,
} from 'graphql';
import _ from 'lodash';
import jwt from 'jsonwebtoken';

import { User, ExpoPushToken } from '../models';
import ExpoPushTokenType from '../types/ExpoPushTokenType';
import config from '../../config';

const invalidateExpoPushToken = {
  type: new GraphQLObjectType({
    name: 'InvalidateExpoPushToken',
    fields: {
      expoPushToken: { type: ExpoPushTokenType },
    },
  }),
  args: {
    expoPushToken: { type: GraphQLString },
  },
  resolve: async ({ request }, { expoPushToken }) => {
    const id_token = _.get(request, 'cookies.id_token');
    if (!id_token) {
      return {};
    }
    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.findOne({
        where: {
          id: verify.id,
        },
      });

      const existingExpoPushToken = await ExpoPushToken.findOne({
        where: {
          token: expoPushToken,
          isValid: true,
          userId: user.id,
        },
      });

      if (!existingExpoPushToken) {
        return {};
      }

      await existingExpoPushToken.update({ isValid: false });

      return { expoPushToken: existingExpoPushToken };
    }
    return {};
  },
};

export default invalidateExpoPushToken;
