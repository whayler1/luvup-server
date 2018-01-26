import DataType from 'sequelize';
import Model from '../sequelize';

const Event = Model.define('Jalapeno', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  isViewed: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  type: {
    type: DataType.ENUM(
      'coin-received',
      'coin-sent',
      'jalapeno-received',
      'jalapeno-sent',
      'relationship-started',
      'relationship-ended',
    ),
  },
});

export default Event;
