import DataType from 'sequelize';
import Model from '../sequelize';

const Coin = Model.define('Coin', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  isUsed: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  userId: {
    type: DataType.UUID,
    primaryKey: true,
  },
});

export default Coin;
