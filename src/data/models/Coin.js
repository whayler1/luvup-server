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

  userId: {
    type: DataType.UUID,
    primaryKey: true,
  },

  // userId: {
  //   type: DataType.UUID,
  //   primaryKey: true,
  // },
  //
  // type: {
  //   type: DataType.ENUM,
  //   values: [
  //     'condo',
  //     'co-op',
  //     'house',
  //     'multi-family',
  //     'timeshare',
  //     'land',
  //     'other',
  //     'auction',
  //   ],
  // },
  //
  // status: {
  //   type: DataType.ENUM,
  //   values: [
  //     'created',
  //     'submitted',
  //     'approved',
  //     'listed',
  //     'in-contract',
  //     'sold',
  //   ],
  //   defaultValue: 'created',
  // },
  //
  // price: { type: DataType.DECIMAL },
  //
  // maintenance: { type: DataType.DECIMAL },
  //
  // taxes: { type: DataType.DECIMAL },
  //
  // sf: { type: DataType.INTEGER },
  //
  // rooms: { type: DataType.INTEGER },
  //
  // bedrooms: { type: DataType.INTEGER },
  //
  // bathrooms: { type: DataType.INTEGER },
  //
  // name: { type: DataType.STRING(100) },
  //
  // description: { type: DataType.TEXT },
  //
  // // Listing amenities
  //

  //
  // isFireplace: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isFurnished: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isLoft: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isOutdoorSpace: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isStorageAvailable: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isWasherDryer: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // // building amenities
  //
  // isDoorman: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isElevator: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isFios: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isGarage: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isGym: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isLaundryInBuilding: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isGreenBuilding: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isParkingAvailable: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isPetsAllowed: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isPiedATerreAllowed: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isSwimmingPool: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
  //
  // isSmokeFree: {
  //   type: DataType.BOOLEAN,
  //   defaultValue: false,
  // },
});

export default Coin;
