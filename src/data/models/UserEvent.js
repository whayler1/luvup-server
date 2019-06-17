import DataType from 'sequelize';
import Model from '../sequelize';

const UserEvent = Model.define('UserEvent', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  isViewed: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  name: {
    type: DataType.ENUM(
      'coin-received',
      'coin-sent',
      'jalapeno-received',
      'jalapeno-sent',
      'relationship-started',
      'relationship-ended',
      'password-changed',
      'lovenote-sent',
      'lovenote-received',
      'quiz-item-sent',
      'quiz-item-received',
      'quiz-item-sent-answered',
      'quiz-item-received-answered',
    ),
  },
});

UserEvent.getWithUserAndRelationship = async function getWithUserAndRelationship(
  userId,
  relationshipId,
) {
  return this.findAll({
    where: { userId, relationshipId },
  });
};

export default UserEvent;
