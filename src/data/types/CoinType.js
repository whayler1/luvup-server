import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

const CoinType = new GraphQLObjectType({
  name: 'Coin',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    isUsed: { type: GraphQLBoolean },
  },
});

export default CoinType;
