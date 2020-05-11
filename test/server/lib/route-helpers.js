'use strict';

const timeshift = require('timeshift');
const stub = sinon.stub().resolves('finished');
const {dateChecker, promiseResponder, home, homeError} =
  require('proxyquire')('../../../src/lib/route-helpers', {
    './model': stub
  });

describe('lib/routesHelpers', () => {
  describe('dateChecker', () => {
    describe('checks for invalid dates', () => {
      it('should return "Invalid date" when the input is not a valid date', () =>
        expect(dateChecker('2019-09-50'))
          .to.equal('Invalid date'));
    });
    describe('checks for valid dates', () => {
      it('should return an ISO formatted timestamp string', () => {
        expect(dateChecker('2019-06-03'))
          .to.be.a('string')
          .and.to.equal('2019-06-03T00:00:00+01:00');
        expect(dateChecker('2019-12-03'))
          .to.be.a('string')
          .and.to.equal('2019-12-03T00:00:00Z');
      });
    });
  });

  describe('promiseResponder', () => {
    const next = sinon.stub();
    const render = sinon.stub();
    const send = sinon.stub();
    const promise = sinon.stub().resolves('data');
    const args = [{query: 'query'}, {render, send}, next];
    const req = args[0];
    it('should return a promise', () =>
      expect(promiseResponder(promise)(...args))
        .to.be.an.instanceOf(Promise)
        .that.is.fulfilled);
    it('should have passed query string from request to the promise function', () =>
      expect(promise)
        .to.have.been.calledOnce
        .and.to.have.been.calledWith(req.query));
    it('should send data from promise', () =>
      expect(send)
        .to.have.been.calledOnce
        .and.to.have.been.calledWith('data'));
    describe('when a component is provided', () => {
      before(() => promiseResponder(promise, 'component')(...args));
      it('should render the component with the data', () =>
        expect(render)
          .to.have.been.calledOnce
          .and.to.have.been.calledWith('component', 'data'));
    });
  });

  describe('home', () => {
    describe('configured with the default dateChecker validator', () => {
      describe('checks query string inputs and passes filter values to the model', () => {
        describe('during a GMT month', () => {
          before('e.g. December', () => timeshift('2020-12-14'));
          describe('when no dates are provided', () => {
            it('should fetch model data', () =>
              expect(home({}))
                .to.be.an.instanceOf(Promise)
                .that.eventually.equals('finished'));
            it('should request model data from the start of the month', () =>
              expect(stub)
                .to.have.been.calledOnce
                .and.to.have.been.calledWith('2020-12-01T00:00:00Z', false));
          });
          describe('when dates are provided', () => {
            before(() => stub.resetHistory());
            it('should fetch model data', () =>
              expect(home({from: '2020-12-07', to: '2020-12-12'}))
                .to.be.an.instanceOf(Promise)
                .that.eventually.equals('finished'));
            it('should request model data from the given range', () =>
              expect(stub)
                .to.have.been.calledOnce
                .and.to.have.been.calledWith('2020-12-07T00:00:00Z', '2020-12-12T00:00:00Z'));
          });
          after('restore current time', () => timeshift());
        });

        describe('during a BST month', () => {
          before('e.g. June', () => timeshift('2020-06-06'));
          describe('when no dates are provided', () => {
            before(() => stub.resetHistory());
            it('should fetch model data', () =>
              expect(home({}))
                .to.be.an.instanceOf(Promise)
                .that.eventually.equals('finished'));
            it('should request model data from the start of the month', () =>
              expect(stub)
                .to.have.been.calledOnce
                .and.to.have.been.calledWith('2020-06-01T00:00:00+01:00', false));
          });
          describe('when dates are provided', () => {
            before(() => stub.resetHistory());
            it('should fetch model data', () =>
              expect(home({from: '2020-06-07', to: '2020-06-12'}))
                .to.be.an.instanceOf(Promise)
                .that.eventually.equals('finished'));
            it('should request model data from the given range', () =>
              expect(stub)
                .to.have.been.calledOnce
                .and.to.have.been.calledWith('2020-06-07T00:00:00+01:00', '2020-06-12T00:00:00+01:00'));
          });
          after('restore current time', () => timeshift());
        });

        describe('when a group is specified', () => {
          before(() => stub.resetHistory());
          it('should fetch model data', () =>
            expect(home({currentGroup: 'a group'}))
              .to.be.an.instanceOf(Promise)
              .that.eventually.equals('finished'));
          it('should request model data from the given range', () =>
            expect(stub)
              .to.have.been.calledOnce
              .and.to.have.been.calledWith(stub.firstCall.args[0], false, 'a group', 'a group'));
        });
      });
    });
  });

  describe('homeError', () => {
    describe('configured with a specific error type', () => {
      describe('adds an error constructor to the "home" route handler', () => {
        const errorHome = homeError(TypeError);
        it('should fail with an error when passed a bunk date', () =>
          expect(
            errorHome({from: '2020-20-20'}))
            .to.be.an.instanceOf(Promise)
            .that.is.eventually.rejectedWith(TypeError, 'Must provide "from" date parameter, and optionally a "to" date'));
        it('without to date, should return start of the month ', () => {
          stub.resetHistory();
          timeshift('2020-01-06');
          errorHome();
          expect(stub)
            .to.have.been.calledOnce
            .and.to.have.been.calledWith('2020-01-01T00:00:00Z', false);
        });
      });
    });
  });
});
