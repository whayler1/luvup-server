/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Sequelize from 'sequelize';
import config from '../config';

const sequelize = new Sequelize(config.databaseUrl, {
  define: {
    freezeTableName: true,
  },
  logging: false,
});

// sequelize
//   .authenticate()
//   .then(() => {
//
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

export default sequelize;
