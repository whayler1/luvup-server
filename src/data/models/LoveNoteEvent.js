import DataType from 'sequelize';
import Model from '../sequelize';

const LoveNoteEvent = Model.define('LoveNoteEvent', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },
});

export default LoveNoteEvent;
