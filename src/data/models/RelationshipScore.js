import DataType from 'sequelize';
import Model from '../sequelize';

const RelationshipScore = Model.define('RelationshipScore', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  score: {
    type: DataType.INTEGER,
    min: 0,
    max: 100,
  },
});

export default RelationshipScore;
