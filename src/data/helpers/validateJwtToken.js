import jwt from 'jsonwebtoken';
import _ from 'lodash';
import config from '../../config';

export default async request => {
  const id_token = _.get(request, 'cookies.id_token');
  if (!id_token) {
    return false;
  }
  const verify = await jwt.verify(id_token, config.auth.jwt.secret);

  return verify;
};
