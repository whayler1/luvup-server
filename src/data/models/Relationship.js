import moment from 'moment';
import DataType from 'sequelize';

import Model from '../sequelize';
import User from './User';
import { datetimeAndTimestamp } from '../helpers/dateFormats';

const Relationship = Model.define('Relationship', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  endDate: {
    type: DataType.DATE,
  },
});

Relationship.hasMany(User, {
  as: 'lover',
});

Relationship.findById = async function findById(id) {
  return this.findOne({ where: { id } });
};

Relationship.prototype.getPlaceholderLover = async function getPlaceholderLover() {
  return User.findOne({
    where: {
      RelationshipId: this.id,
      isPlaceholder: true,
    },
  });
};

Relationship.prototype.endRelationship = async function endRelationship() {
  const endDate = datetimeAndTimestamp(moment());
  await this.update({ endDate });
  const lovers = await this.getLover();
  console.log('lovers', lovers);
  await Promise.all(
    lovers.map(lover => lover.update({ RelationshipId: null })),
  );
  console.log('this tihng');
  return this;
};

export default Relationship;
