import DataType from 'sequelize';
import Model from '../sequelize';

const Location = Model.define('Location', {
  listingId: {
    type: DataType.UUID,
    primaryKey: true,
  },

  address1: {
    type: DataType.TEXT,
  },

  address2: {
    type: DataType.TEXT,
  },

  city: {
    type: DataType.TEXT,
  },

  state: {
    type: DataType.TEXT,
  },

  country: {
    type: DataType.TEXT,
    defaultValue: 'USA',
  },

  zipcode: {
    type: DataType.INTEGER,
  },

  latitude: {
    type: DataType.DECIMAL(10, 7),
  },

  longitude: {
    type: DataType.DECIMAL(10, 7),
  },
});

export default Location;
