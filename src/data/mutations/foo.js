import graphql, { GraphQLString } from 'graphql';
import FooType from '../types/FooType';
import { User, UserLogin, UserClaim, UserProfile } from '../models';

const foo1 = {
  type: FooType,
  args: {
    foo: { type: GraphQLString },
  },
  resolve: (value, { foo }) => {
    console.log('\n\n------ request', value.request, '\n\n ---- fooo --', foo);
    // await new Promise(resolve => setTimeout(resolve, 600));
    return {
      id: '123',
      email: foo,
    };
  },
};

export default foo1;
