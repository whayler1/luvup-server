import { graphql } from 'graphql';
import sequelize from '../sequelize';
import schema from '../schema';
import createLoggedInUser from '../test-helpers/create-logged-in-user';
import { UserEvent } from '../models';
import { UserNotLoggedInError } from '../errors';
import { modelsSync } from '../test-helpers';

const getSuccessfulCreateQuizItemResponse = async () => {
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

  const res = await graphql(schema, query, rootValue, sequelize);

  return { res, user, lover };
};

describe('createQuizItem', () => {
  beforeAll(async () => {
    await modelsSync;
  });

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
    beforeAll(async () => {});

    it('should create and return a quizItem', async () => {
      const {
        res: { data: { createQuizItem: { quizItem } } },
        user,
        lover,
      } = await getSuccessfulCreateQuizItemResponse();

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

    it('should create user events', async () => {
      const { user, lover } = await getSuccessfulCreateQuizItemResponse();

      const userEvents = await UserEvent.findAll({
        where: { relationshipId: user.RelationshipId },
      });

      expect(userEvents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: user.id,
            relationshipId: user.RelationshipId,
            isViewed: false,
            name: 'quiz-item-sent',
          }),
          expect.objectContaining({
            userId: lover.id,
            relationshipId: user.RelationshipId,
            isViewed: false,
            name: 'quiz-item-received',
          }),
        ]),
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
