import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
} from 'graphql';

const RelationshipScoreType = new GraphQLObjectType({
  name: 'RelationshipScore',
  description:
    'A timestamped score indicating your relationship health based on ' +
    'recently received coins and jalapenos',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    score: { type: GraphQLInt },
    relationshipId: { type: GraphQLID },
    userId: { type: GraphQLID },
  },
});

export default RelationshipScoreType;
