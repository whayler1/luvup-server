import { graphql } from 'graphql';
import _ from 'lodash';

import schema from '../schema';
import sequelize from '../sequelize';
import { createUser, deleteUser, loginUser } from '../../../test/helpers';

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

it('should not return a lover request if none exists', async () => {
  const user = await createUser();

  const id_token = loginUser(user);

  const rootValue = {
    request: {
      cookies: {
        id_token,
      },
    },
  };

  const result = await graphql(schema, query, rootValue, sequelize);

  expect(result.data.activeLoverRequest).toMatchObject({ loverRequest: null });
  await deleteUser(user);
});

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

  await deleteUser(user);
  await deleteUser(lover);
  await loverRequest.destroy();
});

it('should return only the most recent if several lover requests have been made', async () => {
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

  await deleteUser(user);
  await deleteUser(lover1);
  await deleteUser(lover2);
  await deleteUser(lover3);
  await loverRequest1.destroy();
  await loverRequest2.destroy();
  await loverRequest3.destroy();
});

it('should not return a lover request if several lover requests have been made and the most recent is accepted', async () => {
  const user = await createUser();
  const lover1 = await createUser();
  const lover2 = await createUser();
  const loverRequest1 = await user.createLoverRequest();
  await loverRequest1.setRecipient(lover1);
  const loverRequest2 = await user.createLoverRequest();
  await loverRequest2.setRecipient(lover2);
  await loverRequest2.update({ isAccepted: true });

  const id_token = loginUser(user);

  const rootValue = {
    request: {
      cookies: {
        id_token,
      },
    },
  };

  const result = await graphql(schema, query, rootValue, sequelize);

  expect(result.data.activeLoverRequest).toMatchObject({ loverRequest: null });

  await deleteUser(user);
  await deleteUser(lover1);
  await deleteUser(lover2);
  await loverRequest1.destroy();
  await loverRequest2.destroy();
});

it('should not return a lover request if several lover requests have been made and the most recent is recipient canceled', async () => {
  const user = await createUser();
  const lover1 = await createUser();
  const lover2 = await createUser();
  const loverRequest1 = await user.createLoverRequest();
  await loverRequest1.setRecipient(lover1);
  const loverRequest2 = await user.createLoverRequest();
  await loverRequest2.setRecipient(lover2);
  await loverRequest2.update({ isRecipientCanceled: true });

  const id_token = loginUser(user);

  const rootValue = {
    request: {
      cookies: {
        id_token,
      },
    },
  };

  const result = await graphql(schema, query, rootValue, sequelize);

  expect(result.data.activeLoverRequest).toMatchObject({ loverRequest: null });

  await deleteUser(user);
  await deleteUser(lover1);
  await deleteUser(lover2);
  await loverRequest1.destroy();
  await loverRequest2.destroy();
});

it('should not return a lover request if several lover requests have been made and the most recent is sender canceled', async () => {
  const user = await createUser();
  const lover1 = await createUser();
  const lover2 = await createUser();
  const loverRequest1 = await user.createLoverRequest();
  await loverRequest1.setRecipient(lover1);
  const loverRequest2 = await user.createLoverRequest();
  await loverRequest2.setRecipient(lover2);
  await loverRequest2.update({ isSenderCanceled: true });

  const id_token = loginUser(user);

  const rootValue = {
    request: {
      cookies: {
        id_token,
      },
    },
  };

  const result = await graphql(schema, query, rootValue, sequelize);

  expect(result.data.activeLoverRequest).toMatchObject({ loverRequest: null });

  await deleteUser(user);
  await deleteUser(lover1);
  await deleteUser(lover2);
  await loverRequest1.destroy();
  await loverRequest2.destroy();
});
