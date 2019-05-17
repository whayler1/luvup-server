import DataType from 'sequelize';

import Model from '../sequelize';
import User from './User';

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

export default Relationship;
