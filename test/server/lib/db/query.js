'use strict';

const proxyquire = require('proxyquire');
const rewire = require('rewire');
const query = rewire('../../../../src/lib/db/query');

describe('lib/db/query', () => {
    describe('filterObject function', () => {
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

    describe('searchTotals function', () => {
        // eslint-disable-next-line no-underscore-dangle
        const totalCountSQL = query.__get__('totalCount');
        // eslint-disable-next-line no-underscore-dangle
        const forTodaySQL = query.__get__('forToday');
        let fakeQuery;
        let stub;
        before(() => {
            stub = sinon.stub();
            stub.returns(Promise.resolve());
            fakeQuery = proxyquire('../../../../src/lib/db/query', {
                './postgres': { manyOrNone: stub }
            });
        });
        describe('when no empty group object exists and query for total searches', () => {
            it('should return a promise', () =>
                expect(fakeQuery.searchTotals('', true))
                    .to.be.an.instanceOf(Promise)
                    .that.is.fulfilled
            );
            it('should pass SQL to the database library with an empty param object', () =>
                expect(stub).to.have.been.calledOnce
                    .and.to.have.been.calledWith(totalCountSQL, {})
            );
        });
        describe('when a group object exists', () => {
            before(() => {
                stub.resetHistory();
            });
            it('should return a promise', () =>
                expect(fakeQuery.searchTotals('group', false))
                    .to.be.an.instanceOf(Promise)
                    .that.is.fulfilled
            );
            it('should pass SQL to the database library with a param object', () =>
                expect(stub).to.have.been.calledOnce
                    .and.to.have.been.calledWith(totalCountSQL + forTodaySQL + ' AND ' +
                    // eslint-disable-next-line no-underscore-dangle
                    query.__get__('groupFilter'), { group: '%group%' })
            );
         });
    });
});
