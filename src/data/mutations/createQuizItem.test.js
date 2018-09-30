import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import models from '../models';
import { UserNotLoggedInError } from '../errors';

describe('createQuizItem', () => {
  describe('when required args not provided', () => {
    it('should return required args error array', async () => {
      const query = `mutation {
        createQuizItem {
          quizItem { id }
        }
      }`;

      const result = await graphql(schema, query, {}, {});

      expect(result.errors).toHaveLength(4);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message:
              'Field "createQuizItem" argument "question" of type "String!" is required but not provided.',
          }),
          expect.objectContaining({
            message:
              'Field "createQuizItem" argument "reward" of type "Int!" is required but not provided.',
          }),
          expect.objectContaining({
            message:
              'Field "createQuizItem" argument "choices" of type "[String]!" is required but not provided.',
          }),
          expect.objectContaining({
            message:
              'Field "createQuizItem" argument "senderChoiceIndex" of type "Int!" is required but not provided.',
          }),
        ]),
      );
    });
  });

  describe('when user is logged in', () => {
    beforeAll(async () => {
      await models.sync();
    });

    it('should create and return a quizItem', async () => {
      const query = `mutation {
        createQuizItem(
          question: "do you love me"
          reward: 2
          choices: ["a","b","c"]
          senderChoiceIndex: 1,
        ) {
          quizItem {
            id
            question
            senderChoiceId
            recipientChoiceId
            reward
            isArchived
            createdAt
            updatedAt
            relationshipId
            senderId
            recipientId
            choices { id answer }
          }
        }
      }`;
      const { user, lover, rootValue } = await createLoggedInUser({
        isInRelationship: true,
      });

      const { data: { createQuizItem: { quizItem } } } = await graphql(
        schema,
        query,
        rootValue,
        sequelize,
      );

      expect(quizItem).toEqual(
        expect.objectContaining({
          question: 'do you love me',
          senderChoiceId: quizItem.choices[1].id,
          recipientChoiceId: null,
          reward: 2,
          isArchived: false,
          relationshipId: user.RelationshipId,
          senderId: user.id,
          recipientId: lover.id,
          choices: expect.arrayContaining([
            expect.objectContaining({ answer: 'a' }),
            expect.objectContaining({ answer: 'b' }),
            expect.objectContaining({ answer: 'c' }),
          ]),
        }),
      );
    });
  });

  describe('when user is not logged in', () => {
    it('should throw an error', async () => {
      const query = `mutation {
        createQuizItem(
          question: "do you love me"
          reward: 2
          choices: ["a","b","c"]
          senderChoiceIndex: 1,
        ) {
          quizItem { id }
        }
      }`;

      const { errors } = await graphql(schema, query, {}, sequelize);
      expect(errors[0].message).toBe(UserNotLoggedInError.message);
    });
  });
});
