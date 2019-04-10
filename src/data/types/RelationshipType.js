import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';

import LoverType from './LoverType';

const RelationshipType = new GraphQLObjectType({
  name: 'Relationship',
  description: 'A relationship between two  users',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    endDate: { type: GraphQLString },
    lovers: {
      type: new GraphQLList(LoverType),
    },
  },
});

export default RelationshipType;
