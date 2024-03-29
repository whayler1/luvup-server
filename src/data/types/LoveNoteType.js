import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
} from 'graphql';
import CoinType from './CoinType';
import JalapenoType from './JalapenoType';

const LoveNoteType = new GraphQLObjectType({
  name: 'LoveNote',
  description: 'A message that can have jalapenos or Luvups attached',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    note: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    relationshipId: { type: GraphQLID },
    senderId: { type: GraphQLID },
    recipientId: { type: GraphQLID },
    numLuvups: { type: GraphQLInt },
    numJalapenos: { type: GraphQLInt },
    isRead: { type: GraphQLBoolean },
    luvups: {
      type: new GraphQLList(CoinType),
    },
    jalapenos: {
      type: new GraphQLList(JalapenoType),
    },
  },
});

export default LoveNoteType;
