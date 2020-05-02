'use strict';

const moment = require('moment');
const proxyquire = require('proxyquire');
const { data, results } = require('./model.fixtures');
const model = require('rewire')('../../../src/lib/model');
const stub = sinon.stub();
const { hourlyUsage } = proxyquire('../../../src/lib/model', {
  './db/query': { hourlyUsage: stub }
});

describe('lib/model', () => {
  describe('helper function', () => {
    describe('objPush adds a field to an object', () => {
      const fn = model.__get__('objPush');
      const obj = {};
      const key = 'a-key';
      const value = 'a value';
      it('should add "key" and "value" to an object', () =>
        expect(fn({}, key, value))
          .to.be.an('object')
          .that.deep.equals({ 'a-key': value })
      );
      it('should add "key" and "value", and return the mutated "obj"', () =>
        expect(fn(obj, key, value)).that.equals(obj)
      );
    });

    describe('datesInRange', () => {
      const fn = model.__get__('datesInRange');
      const dateFrom = moment('2000-01-30');
      const dateTo = moment('2000-02-02');

      it('should produce an array of dates, starting at "dateFrom", finishing at "dateTo"', () =>
        expect(fn(dateFrom, dateTo))
          .to.be.an('array')
          .that.deep.equals([949190400000, 949276800000, 949363200000])
      );
    });

    describe('model mutators', () => {
      const mdl = { birth: [] };

      describe('insertData', () => {
        const fn = model.__get__('insertData');
        const data = [
          { date: '2000-01-01', dataset: 'birth', count: 5 },
          { date: '2000-01-02', dataset: 'birth', count: 2 },
          { date: '2000-01-03', dataset: 'birth', count: 4 }
        ];

        before(() => {
          fn(mdl, data);
        });

        it('should fill the given "model" with the specified "data"', () =>
          expect(mdl)
            .to.be.an('object')
            .that.has.deep.equals({ birth: [
              { date: 946684800000, usage: 5 },
              { date: 946771200000, usage: 2 },
              { date: 946857600000, usage: 4 }
            ]})
        );

        describe('when extra data is available', () => {
          it('should not bork horribly because there is no associated datatype', () =>
            expect(fn(mdl, [{ date: '2000-01-01', dataset: 'death', count: 5 }])).not.to.throw
          );
        });
      });
    });

    describe('dayCounts', () => {
      const dayCounts = model.__get__('dayCounts');

      it('should take start date "2020-03-11", end date "2020-03-11" and return "{week:1,end:0}"', () =>
        expect(dayCounts('2020-03-11', '2020-03-11')).to.deep.equal([1, 0]));
      it('should take start date "2020-03-14", end date "2020-03-14" and return "{week:0,end:1}"', () =>
        expect(dayCounts('2020-03-14', '2020-03-14')).to.deep.equal([0, 1]));
      it('should take start date "2020-03-11", end date "2020-03-12" and return "{week:2,end:0}"', () =>
        expect(dayCounts('2020-03-11', '2020-03-12')).to.deep.equal([2, 0]));
      it('should take start date "2020-03-14", end date "2020-03-15" and return "{week:0,end:2}"', () =>
        expect(dayCounts('2020-03-14', '2020-03-15')).to.deep.equal([0, 2]));
      it('should take start date "2020-03-09", end date "2020-03-15" and return "{week:0,end:2}"', () =>
        expect(dayCounts('2020-03-09', '2020-03-15')).to.deep.equal([5, 2]));
    });

    describe('hours', () => {
      const hours = model.__get__('hours');

      it('should return an array of 24 items', () =>
        expect(hours('title'))
          .to.be.an('object').that.has.keys(['name', 'data', 'colour'])
          .and.property('data').to.be.an('array').that.has.lengthOf(24)
      );

      it('should have an object for each hour of the day, with a count of 0', () =>
        hours().data.forEach((h, n) => expect(h)
          .to.deep.equal({ count: 0, hour: n}))
      );
    });
  });

  describe('hourlyUsage', () => {
    before('setup stub', () => {
      stub.returns(Promise.resolve([
        { count: 5, weekend: 0, hour: 9 },
        { count: 12, weekend: 0, hour: 12 },
        { count: 15, weekend: 0, hour: 13 }
      ]));
    });

    let result = false;
    it('should return an array of trace objects', () =>
      expect(result = hourlyUsage('2020-01-01', '2020-01-01')).to.eventually.be.an('array'));
    it('should have a name field for each object', () => result.then(traces =>
      expect(traces).to.each.have.a.property('name', 'weekday'))
    );

    describe('trace objects', () => {
      it('should have an array of data, with a count for each hour', () => result.then(traces =>
        expect(traces)
          .each.to.have.a.property('data')
          .that.has.lengthOf(24)
          .and.deep.equals([{ hour: 0, count: 0 }, { hour: 1, count: 0 }, { hour: 2, count: 0 }, { hour: 3, count: 0 },
            { hour: 4, count: 0 }, { hour: 5, count: 0 }, { hour: 6, count: 0 }, { hour: 7, count: 0 },
            { hour: 8, count: 0 }, { hour: 9, count: 5 }, { hour: 10, count: 0 }, { hour: 11, count: 0 },
            { hour: 12, count: 12 }, { hour: 13, count: 15 }, { hour: 14, count: 0 }, { hour: 15, count: 0 },
            { hour: 16, count: 0 }, { hour: 17, count: 0 }, { hour: 18, count: 0 }, { hour: 19, count: 0 },
            { hour: 20, count: 0 }, { hour: 21, count: 0 }, { hour: 22, count: 0 }, { hour: 23, count: 0 }
          ])
      ));
    });

    describe('fixtures', () => {
      const lastWeek = moment().add(-7, 'days');
      const yesterday = moment().add(-1, 'days');
      before('setup stub', () => {
        stub.returns(Promise.resolve(data.hourlyUsage));
        return hourlyUsage(lastWeek, yesterday).then(data => result = data);
      });
      it('should produce the fixture result', () => {
        expect(result).to.be.an('array');
        expect(result).to.each.have.property('name');
        expect(result).to.have.nested.property('[0].name', results.hourlyUsage[0].name);
        expect(result).to.have.nested.property('[1].name', results.hourlyUsage[1].name);
        expect(result).to.have.nested.property('[2].name', results.hourlyUsage[2].name);
        expect(result).to.have.nested.property('[0].data').that.deep.equals(results.hourlyUsage[0].data);
        expect(result).to.have.nested.property('[1].data').that.deep.equals(results.hourlyUsage[1].data);
        expect(result).to.have.nested.property('[2].data').that.deep.equals(results.hourlyUsage[2].data);
      });
      it('should produce the fixture result', () =>
        expect(hourlyUsage(lastWeek, yesterday)).to.eventually.deep.equal(results.hourlyUsage)
      );
    });
  });
});
