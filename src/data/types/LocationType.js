import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLFloat as Float,
} from 'graphql';

const LocationType = new ObjectType({
  name: 'Location',
  fields: {
    listingId: { type: new NonNull(ID) },
    address1: { type: StringType },
    address2: { type: StringType },
    city: { type: StringType },
    state: { type: StringType },
    country: { type: StringType },
    zipcode: { type: StringType },
    latitude: { type: Float },
    longitude: { type: Float },
  },
});

export default LocationType;
