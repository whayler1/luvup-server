import _ from 'lodash';
import moment from 'moment';
import { createQuizItem } from '../helpers';

const generateQuizItems = (
  number,
  sender,
  recipient,
  startDate = '05/30/1981',
  options = {},
) =>
  Promise.all(
    _.times(number, i =>
      createQuizItem(
        sender,
        recipient,
        `question${i}`,
        2,
        [`a${i}`, `b${i}`, `c${i}`],
        1,
        {
          createdAt: moment(startDate).subtract(i, 'days').toDate(),
          ...options,
        },
      ),
    ),
  );

export default generateQuizItems;
