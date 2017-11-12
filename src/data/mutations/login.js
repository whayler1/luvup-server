import graphql, { GraphQLString, GraphQLID } from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import UserType from '../types/UserType';
import { User, UserLocal } from '../models';
import passport from '../../passport';
import config from '../../config';

const login = {
  type: UserType,
  args: {
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    // email: { type: GraphQLString },
  },
  resolve: async ({ request }, { username, password }) => {
    const authenticate = await passport.authenticate('local', {
      // failureRedirect: '/login?failure=true',
      session: false,
    })(request, null, foo => {
      console.log('\n\n thing', foo);
    });

    console.log('\n\nauthenticate', authenticate);

    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    const token = jwt.sign(request.user, config.auth.jwt.secret, { expiresIn });
    // console.log('\n\n req.user', req.user);
    // res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
    // const user = await User.create(
    //   {
    //     email,
    //     local: {
    //       username,
    //       password,
    //     },
    //   },
    //   {
    //     include: [{ model: UserLocal, as: 'local' }],
    //   },
    // );
    return {};
  },
};

export default login;
