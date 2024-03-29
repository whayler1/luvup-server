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
    type: DataType.INTEGER,
    defaultValue: 0,
  },

  numJalapenos: {
    type: DataType.INTEGER,
    defaultValue: 0,
  },
});

LoveNote.getWithUserAndRelationship = async function getWithUserAndRelationship(
  recipientId,
  relationshipId,
) {
  return this.findAll({
    where: { recipientId, relationshipId },
  });
};

export default LoveNote;
