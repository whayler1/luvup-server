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

  numLuvups: {
    type: DataType.SMALLINT,
    defaultValue: 0,
  },

  numJalapenos: {
    type: DataType.SMALLINT,
    defaultValue: 0,
  },
});

export default LoveNote;
