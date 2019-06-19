import DataType from 'sequelize';
import Model from '../sequelize';
import QuizItemChoice from './QuizItemChoice';

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

QuizItem.prototype.getChoices = async function getChoices() {
  return QuizItemChoice.findAll({
    where: {
      quizItemId: this.id,
    },
  });
};

QuizItem.prototype.bulkCreateChoices = async function bulkCreateChoices(
  choiceArray,
) {
  return QuizItemChoice.bulkCreate(
    choiceArray.map(answer => ({
      answer,
      quizItemId: this.id,
    })),
  );
};

export default QuizItem;
