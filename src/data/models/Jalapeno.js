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

Jalapeno.getWithUserAndRelationship = async function getWithUserAndRelationship(
  recipientId,
  relationshipId,
) {
  return this.findAll({
    where: { recipientId, relationshipId },
  });
};

export default Jalapeno;
