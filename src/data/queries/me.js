import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { User } from '../models';
import MeType from '../types/MeType';
import config from '../../config';

const me = {
  type: MeType,
  resolve: async ({ request }) => {
    const id_token = _.at(request, 'cookies.id_token')[0];
    if (!id_token) {
      return {};
    }

    const verify = await jwt.verify(id_token, config.auth.jwt.secret);

    if (verify) {
      const user = await User.find({ where: { id: verify.id } });
      const relationship = await user.getRelationship();

      const response = Object.assign({}, user.dataValues);

      if (relationship) {
        const relationshipDataValues = relationship.dataValues;
        const lovers = await relationship.getLover({
          where: {
            $not: {
              id: user.id,
            },
          },
        });
        Object.assign(relationshipDataValues, {
          lovers: lovers.map(lover => lover.dataValues),
        });
        Object.assign(response, { relationship: relationshipDataValues });
      }

      return response;
    }
    return {};
  },
};

export default me;
