import jwt from 'jsonwebtoken';
import _ from 'lodash';

import config from '../../config';
import { UserNotLoggedInError } from '../errors';

export default async request => {
  const id_token = _.get(request, 'cookies.id_token');
  if (!id_token) {
    throw UserNotLoggedInError;
  }

  const verify = await jwt.verify(id_token, config.auth.jwt.secret);
  if (!verify) {
    throw UserNotLoggedInError;
  }

  return verify;
};
