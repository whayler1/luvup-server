import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User } from '../models';
import UserType from '../types/UserType';
import config from '../../config';

const me = {
  type: UserType,
  resolve: async ({ request }) => {
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token) {
      return {};
    }

    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.find({ where: { id: verify.id } });
      const relationship = await user.getRelationship();

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        relationship,
      };
    }
    return {};
  },
};

export default me;
