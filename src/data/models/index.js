import sequelize from '../sequelize';
import User from './User';
import UserLogin from './UserLogin';
import UserClaim from './UserClaim';
import UserProfile from './UserProfile';
import UserPasswordReset from './UserPasswordReset';
import UserRequest from './UserRequest';
import LoveNote from './LoveNote';
import LoverRequest from './LoverRequest';
import Relationship from './Relationship';
import Coin from './Coin';
import Jalapeno from './Jalapeno';
import UserEvent from './UserEvent';
import RelationshipScore from './RelationshipScore';
import ExpoPushToken from './ExpoPushToken';

Relationship.hasMany(RelationshipScore, {
  as: 'relationshipScores',
  foreignKey: 'relationshipId',
});

Relationship.hasMany(LoveNote, {
  as: 'loveNotes',
  foreignKey: 'relationshipId',
});

RelationshipScore.belongsTo(User, {
  as: 'user',
});

User.hasMany(UserEvent, {
  as: 'userEvents',
  foreignKey: 'userId',
});

User.hasMany(ExpoPushToken, {
  as: 'expoPushTokens',
  foreignKey: 'userId',
});

UserEvent.belongsTo(Relationship, {
  as: 'relationship',
});

LoveNote.belongsTo(User, {
  as: 'recipient',
});

LoveNote.belongsTo(User, {
  as: 'sender',
});

LoveNote.hasMany(Coin, {
  as: 'coins',
  foreignKey: 'loveNoteId',
});

LoveNote.hasMany(Jalapeno, {
  as: 'jalapenos',
  foreignKey: 'loveNoteId',
});

Jalapeno.belongsTo(User, {
  as: 'recipient',
});

Jalapeno.belongsTo(User, {
  as: 'sender',
});

Relationship.hasMany(Jalapeno, {
  as: 'jalapenos',
  foreignKey: 'relationshipId',
});

Coin.belongsTo(User, {
  as: 'recipient',
});

Coin.belongsTo(User, {
  as: 'sender',
});

Relationship.hasMany(Coin, {
  as: 'coin',
  foreignKey: 'relationshipId',
});

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
  Coin,
  Jalapeno,
  LoveNote,
  LoverRequest,
  Relationship,
  RelationshipScore,
  UserEvent,
  ExpoPushToken,
};
