import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

const RelationshipScoreByDayType = new GraphQLObjectType({
  name: 'RelationshipScoreByDay',
  description: 'The highest relationship score from a given day',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    score: { type: GraphQLInt },
    relationshipId: { type: GraphQLID },
    userId: { type: GraphQLID },
    day: { type: GraphQLString },
  },
});

export default RelationshipScoreByDayType;
