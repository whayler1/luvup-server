/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import FooType from '../types/FooType';
import { User, UserLogin, UserClaim, UserProfile } from '../models';

const foo = {
  type: FooType,
  resolve: async ({ request }) => {
    //
    const up = await UserProfile.findOne({
      where: { userId: request.user.id },
    });
    const u = await User.findOne({
      where: { id: request.user.id },
    });
    const upProfile = await u.getProfile();
    //
    //

    return (
      request.user && {
        id: request.user.id,
        email: request.user.email,
        picture: up.get('picture'),
        displayName: up.get('displayName'),
        bar: {
          bar: 'bar!',
        },
      }
    );
  },
};

export default foo;
