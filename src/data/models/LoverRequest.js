import DataType from 'sequelize';
import Model from '../sequelize';

const LoverRequest = Model.define('LoverRequest', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  isAccepted: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  senderId: {
    type: DataType.UUID,
    notNull: true,
  },

  recipientId: {
    type: DataType.UUID,
    notNull: true,
  },
});

export default LoverRequest;