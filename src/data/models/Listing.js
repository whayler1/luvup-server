import DataType from 'sequelize';
import Model from '../sequelize';

const Listing = Model.define('Listing', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  userId: {
    type: DataType.UUID,
    primaryKey: true,
  },

  name: {
    type: DataType.STRING(100),
  },
});

export default Listing;
