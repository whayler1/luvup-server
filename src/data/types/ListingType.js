import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

import LocationType from './LocationType';

const ListingType = new GraphQLObjectType({
  name: 'Listing',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
    type: { type: GraphQLFloat },
    status: { type: GraphQLFloat },
    price: { type: GraphQLFloat },
    maintenance: { type: GraphQLFloat },
    taxes: { type: GraphQLFloat },
    sf: { type: GraphQLInt },
    rooms: { type: GraphQLInt },
    bedrooms: { type: GraphQLInt },
    bathrooms: { type: GraphQLInt },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    isDishwasher: { type: GraphQLBoolean },
    isFireplace: { type: GraphQLBoolean },
    isFurnished: { type: GraphQLBoolean },
    isLoft: { type: GraphQLBoolean },
    isOutdoorSpace: { type: GraphQLBoolean },
    isStorageAvailable: { type: GraphQLBoolean },
    isWasherDryer: { type: GraphQLBoolean },
    isDoorman: { type: GraphQLBoolean },
    isElevator: { type: GraphQLBoolean },
    isFios: { type: GraphQLBoolean },
    isGarage: { type: GraphQLBoolean },
    isGym: { type: GraphQLBoolean },
    isLaundryInBuilding: { type: GraphQLBoolean },
    isGreenBuilding: { type: GraphQLBoolean },
    isParkingAvailable: { type: GraphQLBoolean },
    isPetsAllowed: { type: GraphQLBoolean },
    isPiedATerreAllowed: { type: GraphQLBoolean },
    isSwimmingPool: { type: GraphQLBoolean },
    isSmokeFree: { type: GraphQLBoolean },

    location: { type: LocationType },
  },
});

export default ListingType;
