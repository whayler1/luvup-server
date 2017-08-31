import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const BarType = new ObjectType({
  name: 'Bar',
  fields: {
    bar: { type: StringType },
  },
});

export default BarType;
