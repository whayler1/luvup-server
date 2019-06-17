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
});

Coin.getWithUserAndRelationship = async function getWithUserAndRelationship(
  recipientId,
  relationshipId,
) {
  return this.findAll({
    where: { recipientId, relationshipId },
  });
};

export default Coin;
