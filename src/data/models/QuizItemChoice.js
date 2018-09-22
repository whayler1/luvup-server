import DataType from 'sequelize';
import Model from '../sequelize';

const QuizItemChoice = Model.define('QuizItemChoice', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  answer: {
    type: DataType.TEXT,
  },
});

export default QuizItemChoice;
