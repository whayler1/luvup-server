import _ from 'lodash';
import uuidv1 from 'uuid/v1';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { UserRequest, Relationship } from '../models';

const createUser = async (userShape = {}) => {
  const uuid = uuidv1();
  const email = `fake+${uuid}@gmail.com`;
  const newUserRequest = await UserRequest.create({
    email,
    code: '123456',
  });
  const user = await newUserRequest.createUser({
    username: uuid,
    firstName: 'Jason',
    lastName: 'Wents',
    fullName: 'Jason Wents',
    email,
    emailConfirmed: true,
    password: 'Testing123',
    ...userShape,
  });

  return user;
};

const addRelationship = async user => {
  const lover = await createUser({
    firstName: 'Megan',
    lastName: 'Girlfriend',
    fullName: 'Megan Girlfriend',
  });

  const relationship = await Relationship.create();
  await relationship.addLover(user);
  await relationship.addLover(lover);
  await user.setRelationship(relationship);
  await lover.setRelationship(relationship);

  return { relationship, lover };
};

const createLoggedInUser = async (props = { isInRelationship: true }) => {
  const { isInRelationship } = props;
  const user = await createUser();

  const token = jwt.sign(
    _.pick(user.dataValues, 'id', 'username', 'email', 'firstName', 'lastName'),
    config.auth.jwt.secret,
    { expiresIn: 60 },
  );

  const rootValue = {
    request: {
      cookies: {
        id_token: token,
      },
    },
  };

  const returnObj = { user, token, rootValue };

  if (isInRelationship) {
    const { relationship, lover } = await addRelationship(user);
    Object.assign(returnObj, { relationship, lover });
  }

  return returnObj;
};

export default createLoggedInUser;
