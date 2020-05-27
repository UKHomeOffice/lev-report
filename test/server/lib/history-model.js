'use strict';

const moment = require('moment');
const { processHistory } = require('../../../src/lib/history-model');

describe('history-model', () => {
  describe('processHistory', () => {
    describe('transforms text dates and raw counts into numeric equivalents', () => {
      const result = [
        { month: 1585695600, count: 15 },
        { month: 1588287600, count: 567 },
        { month: 1590966000, count: 4567 }
      ];
      const data = result.map(({ month, count }) => ({ month: moment.unix(month).toISOString(), count }));
      it('should return the given object array, but with unix epocs instead of dates', () =>
        expect(processHistory(data))
          .to.be.an('object')
          .that.has.property('data')
          .that.deep.equals(result));
    });
  });
});
