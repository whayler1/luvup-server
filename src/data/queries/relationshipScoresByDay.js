import { GraphQLObjectType, GraphQLList, GraphQLString } from 'graphql';
import _ from 'lodash';
import moment from 'moment';

import { User, RelationshipScore } from '../models';
import RelationshipScoreByDayType from '../types/RelationshipScoreByDayType';
import validateJwtToken from '../helpers/validateJwtToken';

const getRelationshipScoresByDay = rows =>
  rows.reduce((accumulator, row) => {
    const day = moment(new Date(row.createdAt)).format('YYYY-MM-DD');
    const newRow = { relationshipScore: { ...row.dataValues }, day };
    const lastRow = accumulator[accumulator.length - 1];

    if (!accumulator.length || (lastRow && lastRow.day > day)) {
      accumulator.push(newRow);
      return accumulator;
    }

    if (newRow.relationshipScore.score > lastRow.relationshipScore.score) {
      const newAccumulator = [...accumulator];
      newAccumulator[accumulator.length - 1] = newRow;
      return newAccumulator;
    }

    return accumulator;
  }, []);

const getLastScoreDate = async (userId, relationshipId) => {
  const res = await RelationshipScore.findAll({
    limit: 1,
    where: {
      userId,
      relationshipId,
    },
    order: [['createdAt', 'ASC']],
  });
  if (!res && res.length > 0) {
    return '';
  }
  return moment(new Date(res[0].createdAt)).format('YYYY-MM-DD');
};

const relationshipScoresByDay = {
  type: new GraphQLObjectType({
    name: 'RelationshipScoresByDayResource',
    description: 'Get one relationship score per day between the defined dates',
    fields: {
      rows: { type: new GraphQLList(RelationshipScoreByDayType) },
      endDate: { type: GraphQLString },
      startDate: { type: GraphQLString },
      firstDate: { type: GraphQLString },
    },
  }),
  args: {
    endDate: { type: GraphQLString },
    startDate: { type: GraphQLString },
  },
  resolve: async ({ request }, { endDate, startDate }) => {
    if (!_.isString(endDate)) {
      return {};
    }

    const verify = await validateJwtToken(request);

    if (verify) {
      const user = await User.find({ where: { id: verify.id } });
      const userId = user.id;
      const relationshipId = user.RelationshipId;
      const endDateObj = new Date(endDate);
      const createdAtArgs = {
        $gte: endDateObj,
      };

      if (_.isString(startDate)) {
        createdAtArgs.$lte = new Date(startDate);
      }

      const res = await RelationshipScore.findAll({
        where: {
          userId,
          relationshipId,
          createdAt: createdAtArgs,
        },
        order: [['createdAt', 'DESC']],
      });

      const rows = getRelationshipScoresByDay(res);

      const firstDate = await getLastScoreDate(userId, relationshipId);

      return {
        rows,
        endDate,
        startDate,
        firstDate,
      };
    }

    return {};
  },
};

export default relationshipScoresByDay;
