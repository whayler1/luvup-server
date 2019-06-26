import sequelize from '../sequelize';
import User from './User';
import UserInvite from './UserInvite';
import UserLogin from './UserLogin';
import UserClaim from './UserClaim';
import UserProfile from './UserProfile';
import UserPasswordReset from './UserPasswordReset';
import UserRequest from './UserRequest';
import LoveNote from './LoveNote';
import LoveNoteEvent from './LoveNoteEvent';
import LoverRequest from './LoverRequest';
import Relationship from './Relationship';
import Coin from './Coin';
import Jalapeno from './Jalapeno';
import UserEvent from './UserEvent';
import RelationshipScore from './RelationshipScore';
import ExpoPushToken from './ExpoPushToken';
import QuizItem from './QuizItem';
import QuizItemChoice from './QuizItemChoice';
import QuizItemEvent from './QuizItemEvent';

Relationship.hasMany(RelationshipScore, {
  as: 'relationshipScores',
  foreignKey: 'relationshipId',
});

Relationship.hasMany(LoveNote, {
  as: 'loveNotes',
  foreignKey: 'relationshipId',
});

Relationship.hasMany(QuizItem, {
  as: 'quizItems',
  foreignKey: 'relationshipId',
});

User.hasMany(QuizItem, {
  as: 'sentQuizItems',
  foreignKey: 'senderId',
});

User.hasMany(QuizItem, {
  as: 'receivedQuizItems',
  foreignKey: 'recipientId',
});

QuizItem.hasMany(QuizItemChoice, {
  as: 'choices',
  foreignKey: 'quizItemId',
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

UserInvite.belongsTo(User, {
  as: 'sender',
});

UserInvite.belongsTo(Relationship, {
  as: 'relationship',
});

UserInvite.belongsTo(LoverRequest, {
  as: 'loverRequest',
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

LoveNote.belongsTo(Relationship, {
  as: 'relationship',
});

LoveNote.hasMany(Coin, {
  as: 'coins',
  foreignKey: 'loveNoteId',
});

LoveNote.hasMany(Jalapeno, {
  as: 'jalapenos',
  foreignKey: 'loveNoteId',
});

LoveNoteEvent.belongsTo(LoveNote, {
  as: 'loveNote',
});

LoveNoteEvent.belongsTo(UserEvent, {
  as: 'userEvent',
});

QuizItemEvent.belongsTo(QuizItem, {
  as: 'quizItem',
});

QuizItemEvent.belongsTo(UserEvent, {
  as: 'userEvent',
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

LoverRequest.belongsTo(Relationship, {
  as: 'relationship',
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
  UserInvite,
  UserLogin,
  UserClaim,
  UserProfile,
  UserPasswordReset,
  UserRequest,
  Coin,
  Jalapeno,
  LoveNote,
  LoveNoteEvent,
  LoverRequest,
  Relationship,
  RelationshipScore,
  UserEvent,
  ExpoPushToken,
  QuizItem,
  QuizItemChoice,
  QuizItemEvent,
};
