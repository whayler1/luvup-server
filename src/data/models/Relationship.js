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

Relationship.prototype.getPlaceholderLover = () =>
  User.findOne({
    where: {
      RelationshipId: this.id,
      isPlaceholder: true,
    },
  });

Relationship.prototype.endRelationship = async () => {
  const endDate = datetimeAndTimestamp(moment());
  await this.update({ endDate });
  const lovers = this.getLover();
  await Promise.all(lovers.map(lover => lover.update({ RelationshipId: '' })));
  return this;
};

export default Relationship;
