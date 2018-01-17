import jwt from 'jsonwebtoken';
import { User } from '../models';

import UserType from '../types/UserType';
import config from '../../config';

const me = {
  type: UserType,
  resolve: async ({ request }) => {
    // console.log('request', request);
    const verify = await new Promise(resolve =>
      jwt.verify(
        request.cookies.id_token,
        config.auth.jwt.secret,
        (err, result) => {
          if (err) {
            // console.log('\n\n error', err);
            resolve({
              ok: false,
              result: err,
            });
          } else {
            // console.log('\n\n result', result);
            resolve({
              ok: true,
              result,
            });
          }
        },
      ),
    );

    const user = await User.find({ id: verify.result.id });
    const relationship = await user.getRelationship();

    return (
      request.user && {
        id: verify.result.id,
        email: verify.result.email,
        relationship,
      }
    );
  },
};

export default me;
