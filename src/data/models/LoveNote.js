import DataType from 'sequelize';
import Model from '../sequelize';

const LoveNote = Model.define('LoveNote', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  note: {
    type: DataType.TEXT,
  },

  isRead: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },
});

export default LoveNote;
