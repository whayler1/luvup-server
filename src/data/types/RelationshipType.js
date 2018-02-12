import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from 'graphql';

const RelationshipType = new GraphQLObjectType({
  name: 'Relationship',
  description: 'A relationship between two  users',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    endDate: { type: GraphQLString },
  },
});

export default RelationshipType;
