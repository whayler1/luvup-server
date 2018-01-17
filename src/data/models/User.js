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

const User = Model.define(
  'User',
  {
    id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV1,
      primaryKey: true,
    },

    email: {
      type: DataType.STRING(255),
      validate: { isEmail: true },
    },

    emailConfirmed: {
      type: DataType.BOOLEAN,
      defaultValue: false,
    },

    username: {
      type: DataType.STRING(20),
      allowNull: false,
      min: 3,
    },

    firstName: {
      type: DataType.STRING(50),
      min: 2,
    },

    lastName: {
      type: DataType.STRING(50),
      min: 2,
    },

    password: {
      type: DataType.STRING(100),
      allowNull: false,
      min: 8,
    },
  },
  {
    indexes: [{ fields: ['email'] }],
  },
);

export default User;
