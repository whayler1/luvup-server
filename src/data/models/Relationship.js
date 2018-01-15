import DataType from 'sequelize';
import Model from '../sequelize';

const Relationship = Model.define('Relationship', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },
});

export default Relationship;
