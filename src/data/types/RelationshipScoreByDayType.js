import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';
import RelationshipScoreType from './RelationshipScoreType';

const RelationshipScoreByDayType = new GraphQLObjectType({
  name: 'RelationshipScoreByDay',
  description: 'The highest relationship score from a given day',
  fields: {
    day: { type: GraphQLString },
    relationshipScore: { type: RelationshipScoreType },
  },
});

export default RelationshipScoreByDayType;
