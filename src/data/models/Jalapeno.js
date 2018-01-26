import DataType from 'sequelize';
import Model from '../sequelize';

const Jalapeno = Model.define('Jalapeno', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  isExpired: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },
});

export default Jalapeno;
