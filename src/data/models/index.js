import sequelize from '../sequelize';
import User from './User';
import UserLogin from './UserLogin';
import UserClaim from './UserClaim';
import UserProfile from './UserProfile';
import UserPasswordReset from './UserPasswordReset';
import UserRequest from './UserRequest';
import LoverRequest from './LoverRequest';
import Relationship from './Relationship';

import Location from './Location';

import Coin from './Coin';

Relationship.hasMany(User, {
  as: 'lover',
});

User.belongsTo(Relationship);

UserRequest.hasOne(User, {
  foreignKey: 'id',
});

User.hasOne(UserPasswordReset, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'userPasswordReset',
});

User.hasMany(LoverRequest);

LoverRequest.belongsTo(User, {
  as: 'recipient',
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
  targetKey: 'id',
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

function sync(...args) {
  return sequelize.sync(...args);
}

export default { sync };
export {
  User,
  UserLogin,
  UserClaim,
  UserProfile,
  UserPasswordReset,
  UserRequest,
  Location,
  Coin,
  LoverRequest,
  Relationship,
};
