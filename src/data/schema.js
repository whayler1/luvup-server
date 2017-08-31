import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import me from './queries/me';
import foo from './queries/foo';
import news from './queries/news';

import fooMutation from './mutations/foo';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      me,
      news,
      foo,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      fooMutation,
    },
  }),
});

export default schema;
