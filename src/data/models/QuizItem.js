import DataType from 'sequelize';
import Model from '../sequelize';

const QuizItem = Model.define('QuizItem', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  question: { type: DataType.TEXT },
  senderChoiceId: { type: DataType.UUID },
  recipientChoiceId: { type: DataType.UUID },
  reward: {
    type: DataType.INTEGER,
    min: 0,
  },
  isArchived: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },
});

QuizItem.getWithUserAndRelationship = async function getWithUserAndRelationship(
  recipientId,
  relationshipId,
) {
  return this.findAll({
    where: { recipientId, relationshipId },
  });
};

export default QuizItem;
