import DataType from 'sequelize';
import Model from '../sequelize';

const QuizItem = Model.define('QuizItem', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  answer: {
    type: DataType.TEXT,
  },
});

export default QuizItem;
