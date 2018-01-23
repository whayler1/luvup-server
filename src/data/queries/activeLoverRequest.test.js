import { graphql } from 'graphql';
import _ from 'lodash';

import schema from '../schema';
import sequelize from '../sequelize';
import config from '../../config';
import { createUser, deleteUser, loginUser } from '../../../test/helpers';

const dateRegex = /^[A-z]{3} [A-z]{3} \d{1,2} \d{4} \d{2}:\d{2}:\d{2} [A-Z]{3}-\d{4} \([A-Z]{3}\)$/;

const query = `{
  activeLoverRequest {
    loverRequest {
      id isAccepted isSenderCanceled isRecipientCanceled createdAt
      recipient {
        id username firstName lastName email
      }
    }
  }
}`;

it('should return a lover request with a recipient if there is one', async () => {
  const user = await createUser();
  const lover = await createUser();
  const loverRequest = await user.createLoverRequest();
  await loverRequest.setRecipient(lover);

  const id_token = loginUser(user);

  const rootValue = {
    request: {
      cookies: {
        id_token,
      },
    },
  };

  const result = await graphql(schema, query, rootValue, sequelize);

  const matchObj = {
    loverRequest: {
      ..._.pick(loverRequest.dataValues, [
        'id',
        'isAccepted',
        'isSenderCanceled',
        'isRecipientCanceled',
      ]),
      recipient: {
        ..._.pick(lover.dataValues, [
          'id',
          'username',
          'firstName',
          'lastName',
          'email',
        ]),
      },
    },
  };

  expect(result.data.activeLoverRequest).toMatchObject(matchObj);
  expect(result.data.activeLoverRequest.loverRequest.createdAt).toMatch(
    dateRegex,
  );

  await deleteUser(user);
  await deleteUser(lover);
  await loverRequest.destroy();
});

it('if several lover requests have been made, only the most recent should be displayed', async () => {
  const user = await createUser();
  const lover1 = await createUser();
  const lover2 = await createUser();
  const lover3 = await createUser();
  const loverRequest1 = await user.createLoverRequest();
  await loverRequest1.setRecipient(lover1);
  const loverRequest2 = await user.createLoverRequest();
  await loverRequest2.setRecipient(lover2);
  const loverRequest3 = await user.createLoverRequest();
  await loverRequest3.setRecipient(lover3);

  const id_token = loginUser(user);

  const rootValue = {
    request: {
      cookies: {
        id_token,
      },
    },
  };

  const result = await graphql(schema, query, rootValue, sequelize);

  const matchObj = {
    loverRequest: {
      ..._.pick(loverRequest3.dataValues, [
        'id',
        'isAccepted',
        'isSenderCanceled',
        'isRecipientCanceled',
      ]),
      recipient: {
        ..._.pick(lover3.dataValues, [
          'id',
          'username',
          'firstName',
          'lastName',
          'email',
        ]),
      },
    },
  };

  expect(result.data.activeLoverRequest).toMatchObject(matchObj);
  expect(result.data.activeLoverRequest.loverRequest.createdAt).toMatch(
    dateRegex,
  );

  await deleteUser(user);
  await deleteUser(lover1);
  await deleteUser(lover2);
  await deleteUser(lover3);
  await loverRequest1.destroy();
  await loverRequest2.destroy();
  await loverRequest3.destroy();
});
