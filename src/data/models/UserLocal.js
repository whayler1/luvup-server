/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import DataType from 'sequelize';
import Model from '../sequelize';

const UserLocal = Model.define('UserLocal', {
  username: {
    type: DataType.STRING(50),
    min: 5,
  },

  password: {
    type: DataType.STRING(100),
    min: 8,
  },
});

export default UserLocal;
