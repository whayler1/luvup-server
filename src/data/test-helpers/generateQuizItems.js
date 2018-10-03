import _ from 'lodash';
import moment from 'moment';
import { createQuizItemObj } from '../mutations/createQuizItem';

const generateQuizItems = (
  number,
  sender,
  recipient,
  startDate = '05/30/1981',
) =>
  Promise.all(
    _.times(number, i =>
      createQuizItemObj(
        sender,
        recipient,
        `question${i}`,
        2,
        [`a${i}`, `b${i}`, `c${i}`],
        1,
        {
          createdAt: moment(startDate).subtract(i, 'days').toDate(),
        },
      ),
    ),
  );

export default generateQuizItems;
