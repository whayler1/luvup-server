import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import LocationType from './LocationType';

const ListingType = new ObjectType({
  name: 'Listing',
  fields: {
    id: { type: new NonNull(ID) },
    userId: { type: new NonNull(ID) },
    name: { type: StringType },
    location: { type: LocationType },
  },
});

export default ListingType;
