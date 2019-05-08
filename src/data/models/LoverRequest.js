import DataType from 'sequelize';
import Model from '../sequelize';

const LoverRequest = Model.define('LoverRequest', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  relationshipId: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
  },

  isAccepted: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  isSenderCanceled: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  isRecipientCanceled: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },
});

export default LoverRequest;
