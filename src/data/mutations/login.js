import graphql, { GraphQLString, GraphQLID, GraphQLObjectType } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import UserType from '../types/UserType';
import { User } from '../models';
import passport from '../../passport';
import config from '../../config';

const login = {
  type: new GraphQLObjectType({
    name: 'Login',
    fields: {
      user: { type: UserType },
      token: { type: GraphQLString },
    },
  }),
  args: {
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    // email: { type: GraphQLString },
  },
  resolve: async ({ request }, { username, password }) => {
    const authenticate = await new Promise(resolve =>
      passport.authenticate('local', (err, user) => {
        console.log('\n\n thing===>', err, '\n\n ---- ', user);
        resolve({ err, user });
      })({ body: { username, password } }, null),
    );

    const user = await User.find({ id: authenticate.user.id });

    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    const token = jwt.sign(authenticate.user, config.auth.jwt.secret, {
      expiresIn,
    });

    return {
      user,
      token,
    };
  },
};

export default login;
