'use strict';

const proxyquire = require('proxyquire');
const timeshift = require('timeshift');
const fixtures = require('./query.fixtures');
const rewire = require('rewire');
const query = rewire('../../../../src/lib/db/query');
const stubs = {
  one: sinon.stub().resolves(),
  manyOrNone: sinon.stub().resolves()
};
const fakeQuery = proxyquire('../../../../src/lib/db/query', {
  './postgres': stubs
});

describe('lib/db/query', () => {
  describe('helper functions', () => {
    describe('filterObject', () => {
      // eslint-disable-next-line no-underscore-dangle
      const fn = query.__get__('filterObject');
      it('should filter empty fields from an object', () =>
        expect(fn({ field: undefined }))
          .to.be.an('object')
          .that.is.empty
      );
      it('should not filter non-empty fields from an object', () =>
        expect(fn({ field: 'value' }))
          .to.be.an('object')
          .that.deep.equals({ field: 'value' })
      );
      it('should filter empty fields from an object', () =>
        expect(fn({ field1: 'value1', emptyField1: undefined, field2: 'value2', EmptyField2: undefined }))
          .to.be.an('object')
          .that.deep.equals({ field1: 'value1', field2: 'value2' })
      );
    });

    describe('sqlBuilder', () => {
      // eslint-disable-next-line no-underscore-dangle
      const fn = query.__get__('sqlBuilder');
      describe('takes parts of an SQL string as an object, and returns a complete SQL query string', () => {
        describe('simple select query', () => {
          it('should return a query, built from the select field', () =>
            expect(fn({ 'SELECT': '"my name is Colin"' }))
              .to.be.a('string')
              .that.equals('SELECT "my name is Colin"')
          );
          it('should only use the necessary fields from the object', () =>
            expect(fn({ 'SELECT': '1', 'FROM': undefined, 'WHERE': false, 'GROUP BY': null }))
              .to.be.a('string')
              .that.equals('SELECT 1')
          );

          describe('with a from field', () => {
            it('should return a query, built from the select and from fields', () =>
              expect(fn({
                'SELECT': 'COUNT(lemons)',
                'FROM': 'lemon_tree'
              }))
                .to.be.a('string')
                .that.equals('SELECT COUNT(lemons) FROM lemon_tree')
            );
          });
        });

        describe('select with filters', () => {
          it('should return a query, built from the select, from and where fields', () =>
            expect(fn({
              'SELECT': 'date_time::DATE AS date, dataset, username, count(*)::INTEGER',
              'FROM': 'my_table',
              'WHERE': 'date_time > $date'
            }))
              .to.be.a('string')
              .that.equals('SELECT date_time::DATE AS date, dataset, username, count(*)::INTEGER ' +
              'FROM my_table WHERE date_time > $date')
          );
          it('should return a query, built from the select, from and where fields, with multiple filters', () =>
            expect(fn({
              'SELECT': 'date_time::DATE AS date, dataset, username, count(*)::INTEGER',
              'FROM': 'lev_audit',
              'WHERE': ['date_time > $date', 'dataset = 4', 'username LIKE \'colin%\'']
            }))
              .to.be.a('string')
              .that.equals('SELECT date_time::DATE AS date, dataset, username, count(*)::INTEGER ' +
              'FROM lev_audit WHERE date_time > $date AND dataset = 4 AND username LIKE \'colin%\'')
          );
          it('should return a query, built from the select, from and where fields, with multiple empty filters', () =>
            expect(fn({
              'SELECT': 'date_time::DATE AS date, dataset, username, count(*)::INTEGER',
              'FROM': 'lev_audit',
              'WHERE': [false, 'dataset = 4', 'blah', '', null, undefined]
            }))
              .to.be.a('string')
              .that.equals('SELECT date_time::DATE AS date, dataset, username, count(*)::INTEGER ' +
              'FROM lev_audit WHERE dataset = 4 AND blah')
          );
          const group = false;
          it('should return a query, built from multiple empty filters (EXAMPLE)', () =>
            expect(fn({
              'SELECT': 'date_time::DATE AS date, dataset, username, count(*)::INTEGER',
              'FROM': 'lev_audit',
              'WHERE': ['dataset = 4', group && 'group=$group', undefined]
            }))
              .to.be.a('string')
              .that.equals('SELECT date_time::DATE AS date, dataset, username, count(*)::INTEGER ' +
              'FROM lev_audit WHERE dataset = 4')
          );
        });

        describe('select with grouping', () => {
          const sqlObj = {
            'SELECT': 'first_name, surname, COUNT(*)',
            'FROM': 'aTable',
            'GROUP BY': 'first_name, surname'
          };

          it('should return a query, built from the select, from and grouping fields', () =>
            expect(fn(sqlObj))
              .to.be.a('string')
              .that.equals('SELECT first_name, surname, COUNT(*) FROM aTable GROUP BY first_name, surname')
          );

          describe('when a custom "joiner" is specified', () => {
            it('should return the same query, using the specified "joiner" character', () =>
              expect(fn(sqlObj, '\n'))
                .to.be.a('string')
                .that.equals('SELECT first_name, surname, COUNT(*)\nFROM aTable\nGROUP BY first_name, surname')
            );
            it('should return the same query, using the specified "joiner" string', () =>
              expect(fn(sqlObj, '\n  '))
                .to.be.a('string')
                .that.equals('SELECT first_name, surname, COUNT(*)\n  FROM aTable\n  GROUP BY first_name, surname')
            );
          });
        });
      });
    });
  });

  describe('usageByDateType', () => {
    const from = 'yesterday', to = 'today', group = 'group';
    describe('when called with from date', () => {
      before(() => {
        stubs.manyOrNone.resetHistory();
        fakeQuery.usageByDateType(from);
      });
      it('should build an SQL statement with `from` date filter', () =>
        expect(stubs.manyOrNone).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.usageByDateType.fromDateOnlySQL, { from })
      );

      describe('and to date, and group', () => {
        before(() => {
          stubs.manyOrNone.resetHistory();
          fakeQuery.usageByDateType(from, to, group);
        });
        it('should build an SQL statement with `from`/`to` date and `group` filters', () =>
          expect(stubs.manyOrNone).to.have.been.calledOnce
            .and.to.have.been.calledWith(fixtures.usageByDateType.allParametersSQL, { from, to, group })
        );
      });
    });
  });

  describe('usageByType', () => {
    const from = 'yesterday', to = 'today';
    describe('when called with from date', () => {
      before(() => {
        stubs.manyOrNone.resetHistory();
        fakeQuery.usageByType(from);
      });
      it('should build an SQL statement with `from` date filter', () =>
        expect(stubs.manyOrNone).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.usageByType.fromDateSQL, { from })
      );

      describe('and to date, and group', () => {
        before(() => {
          stubs.manyOrNone.resetHistory();
          fakeQuery.usageByType(from, to);
        });
        it('should build an SQL statement with `from`/`to` date filters', () =>
          expect(stubs.manyOrNone).to.have.been.calledOnce
            .and.to.have.been.calledWith(fixtures.usageByType.fromToSQL, { from, to })
        );
      });
    });
  });

  describe('usageByGroup', () => {
    const from = 'yesterday', to = 'today';
    describe('when called with from date', () => {
      before(() => {
        stubs.manyOrNone.resetHistory();
        fakeQuery.usageByGroup(from);
      });
      it('should build an SQL statement with `from` date filter', () =>
        expect(stubs.manyOrNone).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.usageByGroup.fromDateSQL, { from })
      );

      describe('and to date, and group', () => {
        before(() => {
          stubs.manyOrNone.resetHistory();
          fakeQuery.usageByGroup(from, to);
        });
        it('should build an SQL statement with `from`/`to` date filters', () =>
          expect(stubs.manyOrNone).to.have.been.calledOnce
            .and.to.have.been.calledWith(fixtures.usageByGroup.fromToSQL, { from, to })
        );
      });
    });
  });

  describe('usageByUser', () => {
    const from = 'yesterday', to = 'today';
    describe('when called with from date', () => {
      before(() => {
        stubs.manyOrNone.resetHistory();
        fakeQuery.usageByUser(from);
      });
      it('should build an SQL statement with `from` date filter', () =>
        expect(stubs.manyOrNone).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.usageByUser.fromDateSQL, { from })
      );

      describe('and to date, and group', () => {
        before(() => {
          stubs.manyOrNone.resetHistory();
          fakeQuery.usageByUser(from, to);
        });
        it('should build an SQL statement with `from`/`to` date filters', () =>
          expect(stubs.manyOrNone).to.have.been.calledOnce
            .and.to.have.been.calledWith(fixtures.usageByUser.fromToSQL, { from, to })
        );
      });
    });
  });

  describe('searchTotals function', () => {
    describe('when `true` is provided', () => {
      before(() => {
        stubs.one.resetHistory();
        fakeQuery.searchTotals(true);
      });
      it('should pass SQL to the database library', () =>
        expect(stubs.one).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.searchTotals.totalCountSQL, [])
      );
    });

    describe('when `false` is provided', () => {
      before(() => {
        stubs.one.resetHistory();
        timeshift('2020-06-06');
        fakeQuery.searchTotals(false);
      });
      it('should pass SQL to the database library with the timestamp for the beginning of the day', () =>
        expect(stubs.one).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.searchTotals.todayCountSQL, { from: '2020-06-06T00:00:00+01:00' })
      );
      after('restore current time', () => timeshift());
    });
  });

  describe('searchWithGroupFiltering function', () => {
    const from = '2000-01-30';
    const to = '2000-02-02';
    const group = 'HMRC';
    const withoutGroups = ['HMPO', 'DWP'];
    it('should return a promise', () =>
      expect(fakeQuery.searchWithGroupFiltering())
        .to.be.an.instanceOf(Promise)
        .that.is.fulfilled
    );
    describe('when function is called with empty dates', () => {
      it('should build an sql statement when only group is provided', () => {
        stubs.one.resetHistory();
        fakeQuery.searchWithGroupFiltering(from, '', group, '');
        expect(stubs.one).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.searchWithGroupFiltering.groupOnlySQL, {from, group});
      });
      it('should build an sql statement when only multiple withoutGroups is provided', () => {
        stubs.one.resetHistory();
        fakeQuery.searchWithGroupFiltering(from, '', '', withoutGroups);
        expect(stubs.one).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.searchWithGroupFiltering.multipleWithoutGroupsOnlySQL,
          {from, withoutGroups});
      });
      it('should build an sql statement when only single withoutGroups is provided', () => {
        stubs.one.resetHistory();
        fakeQuery.searchWithGroupFiltering(from, '', '', group);
        expect(stubs.one).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.searchWithGroupFiltering.singleWithoutGroupsOnlySQL,
          {from, withoutGroups: group});
      });
    });
    describe('when function is called with arguments', () => {
      it('should build an sql statement when `to, from and group` are provided', () => {
        stubs.one.resetHistory();
        fakeQuery.searchWithGroupFiltering(from, to, group);
        expect(stubs.one).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.searchWithGroupFiltering.fromToGroupSQL, {from, to, group});
      });
      it('should build an sql statement when `to, from, group and withoutGroups` are provided', () => {
        stubs.one.resetHistory();
        fakeQuery.searchWithGroupFiltering(from, to, group, withoutGroups);
        expect(stubs.one).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.searchWithGroupFiltering.fromToGroupMultipleWithoutGroupsSQL,
          {from, to, group, withoutGroups});
      });
    });
    describe('when function is called with date arguments and withoutGroups is a String', () => {
      it('should build an sql statement when `to, from and withoutGroup` are provided', () => {
        stubs.one.resetHistory();
        fakeQuery.searchWithGroupFiltering(from, to, '', group);
        expect(stubs.one).to.have.been.calledWith(
          fixtures.searchWithGroupFiltering.fromToSingleWithoutGroupsSQL,
          {from, to, withoutGroups: group});
      });
    });
  });

  describe('hourlyUsage', () => {
    const counts = [
      { count: 5, weekend: true, hour: 9 },
      { count: 12, weekend: true, hour: 12 },
      { count: 15, weekend: true, hour: 13 }
    ];
		before(() => {
      stubs.manyOrNone.returns(Promise.resolve(counts));
      stubs.manyOrNone.resetHistory();
    });


    // Calling without a from date is too inefficient, so throw error instead
    it('should throw an error when called without a "from" date', () =>
      expect(() => fakeQuery.hourlyUsage()).to.throw('Must be used with "from" date!'));
    it.skip('should build an SQL statement when no parameters are provided', () =>
      expect(stubs.manyOrNone).to.have.been.calledOnce
        .and.to.have.been.calledWith(fixtures.hourlyUsage.noParameterSQL)
    );

    describe('when called with from date', () => {
      before(() => stubs.manyOrNone.resetHistory());
      it('should return an array of hour counts from the DB', () =>
        expect(fakeQuery.hourlyUsage('today'))
          .to.be.an.instanceOf(Promise)
          .that.eventually.deep.equals(counts)
      );
      it('should build an SQL statement with `from` date filter', () =>
        expect(stubs.manyOrNone).to.have.been.calledOnce
          .and.to.have.been.calledWith(fixtures.hourlyUsage.fromDateOnlySQL, { from: 'today' })
      );

      describe('and to date, and group', () => {
        before(() => {
          stubs.manyOrNone.resetHistory();
          fakeQuery.hourlyUsage('yesterday', 'today', 'group');
        });
        it('should build an SQL statement with `from`/`to` date and `group` filters', () =>
          expect(stubs.manyOrNone).to.have.been.calledOnce
            .and.to.have.been.calledWith(
            fixtures.hourlyUsage.allParametersSQL,
            { from: 'yesterday', to: 'today', group: 'group' }
          )
        );
      });
    });
  });

  describe('cumulativeUsage', () => {
    const counts = [
      { month: '2017-11-01 00:00:00+00', count: 193 },
      { month: '2017-12-01 00:00:00+00', count: 608 },
      { month: '2018-01-01 00:00:00+00', count: 1013 },
      { month: '2018-02-01 00:00:00+00', count: 1260 },
      { month: '2018-03-01 00:00:00+00', count: 1632 }
    ];
    before(() => {
      stubs.manyOrNone.returns(Promise.resolve(counts));
      stubs.manyOrNone.resetHistory()
    });

    it('should return an array of month counts from the DB', () =>
      expect(fakeQuery.cumulativeUsage())
        .to.be.an.instanceOf(Promise)
        .that.eventually.deep.equals(counts)
    );
    it('should build an SQL statement', () =>
      expect(stubs.manyOrNone).to.have.been.calledOnce
        .and.to.have.been.calledWith(fixtures.cumulativeUsageSQL, [])
    );
  });
});
