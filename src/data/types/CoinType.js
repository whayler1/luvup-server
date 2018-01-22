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
  description:
    'The main currency in Luvup. Lovers send these to one another to recognize good deads or just say I love you.',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    isUsed: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    senderId: { type: new GraphQLNonNull(GraphQLID) },
    recipientId: { type: new GraphQLNonNull(GraphQLID) },
    relationshipId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export default CoinType;
