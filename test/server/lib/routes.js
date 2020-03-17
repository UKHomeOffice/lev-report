'use strict';

const rewire = require('rewire');
const routes = rewire('../../../src/lib/routes');

describe('lib/routes', () => {
	describe('helper functions', () => {
		describe('dateChecker', () => {
			// eslint-disable-next-line no-underscore-dangle
			const fn = routes.__get__('dateChecker');
			describe('checks for invalid dates', () => {
				it('should return false when the input is not a valid date', () =>
					expect(fn('2019-09-50'))
						.to.be.false
				);
			});
			describe('checks for valid dates', () => {
				it('should return an ISO formatted date string when the input is a valid date', ()=> {
					expect(fn('2019-09-03'))
						.to.be.a('string')
						.and.to.equal('2019-09-03');
				});
			});
		});
	});
});