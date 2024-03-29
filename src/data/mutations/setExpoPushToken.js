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

const setExpoPushToken = {
  type: new GraphQLObjectType({
    name: 'SetExpoPushToken',
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
        },
      });

      if (existingExpoPushToken) {
        if (existingExpoPushToken.userId === user.id) {
          return { expoPushToken: existingExpoPushToken };
        }
        await existingExpoPushToken.update({ isValid: false });
      }

      const expoPushTokenObj = await user.createExpoPushToken({
        token: expoPushToken,
      });

      return { expoPushToken: expoPushTokenObj };
    }
    return {};
  },
};

export default setExpoPushToken;
