import DataType from 'sequelize';
import Model from '../sequelize';

const QuizItemEvent = Model.define('QuizItemEvent', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },
});

export default QuizItemEvent;
