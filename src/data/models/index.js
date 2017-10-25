/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import sequelize from '../sequelize';
import User from './User';
import UserLogin from './UserLogin';
import UserClaim from './UserClaim';
import UserProfile from './UserProfile';

import Listing from './Listing';
import Location from './Location';

import Coin from './Coin';

User.hasMany(Coin, {
  foreignKey: 'userId',
  as: 'coins',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Coin.belongsTo(User, {
  foreignKey: 'senderId',
  targetKey: 'id',
  as: 'sender',
});

Coin.belongsTo(User, {
  foreignKey: 'recipientId',
  tarngetKey: 'id',
  as: 'recipient',
});

User.hasMany(UserLogin, {
  foreignKey: 'userId',
  as: 'logins',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

User.hasMany(UserClaim, {
  foreignKey: 'userId',
  as: 'claims',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

User.hasOne(UserProfile, {
  foreignKey: 'userId',
  as: 'profile',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Listing.hasOne(Location, {
  foreignKey: 'listingId',
  as: 'location',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

function sync(...args) {
  return sequelize.sync(...args);
}

export default { sync };
export { User, UserLogin, UserClaim, UserProfile, Listing, Location, Coin };
