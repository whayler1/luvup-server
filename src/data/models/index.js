import sequelize from '../sequelize';
import User from './User';
import UserLogin from './UserLogin';
import UserClaim from './UserClaim';
import UserProfile from './UserProfile';
import UserLocal from './UserLocal';
import UserPasswordReset from './UserPasswordReset';
import UserRequest from './UserRequest';

import LoverRequest from './LoverRequest';

import Listing from './Listing';
import Location from './Location';

import Coin from './Coin';

UserRequest.hasOne(User, {
  foreignKey: 'id',
});

User.hasMany(User, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'ex',
});

User.hasOne(User, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'lover',
});

User.hasOne(UserPasswordReset, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'userPasswordReset',
});

User.hasOne(LoverRequest, {
  foreignKey: 'recipientId',
  sourceKey: 'id',
  as: 'loverRequest',
});

User.hasOne(LoverRequest, {
  foreignKey: 'senderId',
  sourceKey: 'id',
  as: 'requestedLover',
});

User.hasMany(Coin, {
  foreignKey: 'recipientId',
  sourceKey: 'id',
  as: 'receivedCoins',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

User.hasMany(Coin, {
  foreignKey: 'senderId',
  sourceKey: 'id',
  as: 'sentCoins',
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

User.hasOne(UserLocal, {
  foreignKey: 'userId',
  as: 'local',
});

function sync(...args) {
  return sequelize.sync(...args);
}

export default { sync };
export {
  User,
  UserLogin,
  UserClaim,
  UserProfile,
  UserLocal,
  UserPasswordReset,
  UserRequest,
  Listing,
  Location,
  Coin,
  LoverRequest,
};
