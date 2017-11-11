import { User, UserLocal } from '../models';

import UserType from '../types/UserType';

const me = {
  type: UserType,
  resolve({ request }) {
    // console.log('request', request);
    return (
      request.user && {
        id: request.user.id,
        email: request.user.email,
        profile: { a: 'a' },
      }
    );
  },
};

export default me;
