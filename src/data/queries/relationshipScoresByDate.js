import graphql, {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import moment from 'moment';

import { User, RelationshipScore } from '../models';
import config from '../../config';
import RelationshipScoreByDayType from '../types/RelationshipScoreByDayType';
import validateJwtToken from '../helpers/validateJwtToken';

const getRelationshipScoresByDate = rows =>
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

const relationshipScores = {
  type: new GraphQLObjectType({
    name: 'RelationshipScoresByDateResource',
    description: 'Get one relationship score per day between the defined dates',
    fields: {
      rows: { type: new GraphQLList(RelationshipScoreByDayType) },
      endDate: { type: GraphQLString },
      startDate: { type: GraphQLString },
    },
  }),
  args: {
    endDate: { type: GraphQLString },
    startDate: { type: GraphQLString },
  },
  resolve: async ({ request }, { endDate, startDate }) => {
    const verify = await validateJwtToken(request);

    if (verify) {
      const user = await User.find({ where: { id: verify.id } });
      if (!_.isString(endDate)) {
        return {};
      }

      const endDateObj = new Date(endDate);
      const createdAtArgs = {
        $gte: endDateObj,
      };

      if (_.isString(startDate)) {
        createdAtArgs.$lte = new Date(startDate);
      }

      const res = await RelationshipScore.findAll({
        where: {
          userId: user.id,
          relationshipId: user.RelationshipId,
          createdAt: createdAtArgs,
        },
        order: [['createdAt', 'DESC']],
      });

      const rows = getRelationshipScoresByDate(res);

      return {
        rows,
        endDate,
        startDate,
      };
    }

    return {};
  },
};

export default relationshipScores;
