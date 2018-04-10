import graphql, {
  GraphQLString,
  GraphQLBoolean,
  GraphQLObjectType,
} from 'graphql';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import jwt from 'jsonwebtoken';

// import LoverRequestType from '../types/LoverRequestType';
import { User } from '../models';
// import emailHelper from '../helpers/email';
import config from '../../config';
// import analytics from '../../services/analytics';

const setExpoPushToken = {
  type: new GraphQLObjectType({
    name: 'SetExpoPushToken',
    fields: {
      success: { type: GraphQLBoolean },
    },
  }),
  args: {
    expoPushToken: { type: GraphQLString },
  },
  resolve: async ({ request }, { expoPushToken }) => {
    const id_token = _.get(request, 'cookies.id_token');
    if (!id_token) {
      return { success: false };
    }
    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.findOne({
        where: {
          id: verify.id,
        },
      });

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(expoPushToken, salt);

      await user.update({
        expoPushToken: hash,
      });
      return { success: true };
    }
    return { success: false };
  },
};

export default setExpoPushToken;
