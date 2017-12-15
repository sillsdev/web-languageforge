import * as angular from 'angular';
import 'angular-mocks';

import {
  BytesFilterFunction, EncodeURIFilterFunction, RelativeTimeFilterFunction
} from './filters';

describe('Filters: ', () => {
  let $filter: angular.IFilterService;

  beforeEach(angular.mock.module('coreModule'));

  beforeEach(angular.mock.inject(($filterMock: angular.IFilterService) => {
      $filter = $filterMock;
  }));

  describe('BytesFilter', () => {
    const bytesFilter = $filter<BytesFilterFunction>('bytes');
    it('should initialize correctly', () => {
      expect(bytesFilter).toBeDefined();
    });

    it('should deal with various NaN', () => {
      expect(bytesFilter(NaN)).toBe('-');
      expect(bytesFilter(undefined)).toBe('-');
      expect(bytesFilter(Infinity)).toBe('-');
    });

    it('should add various units', () => {
      expect(bytesFilter(2)).toBe('2.0 bytes');
      expect(bytesFilter(2 * 1024)).toBe('2.0 kB');
      expect(bytesFilter(2 * 1024 * 1024)).toBe('2.0 MB');
      expect(bytesFilter(2 * 1024 * 1024 * 1024)).toBe('2.0 GB');
      expect(bytesFilter(2 * 1024 * 1024 * 1024 * 1024)).toBe('2.0 TB');
      expect(bytesFilter(2 * 1024 * 1024 * 1024 * 1024 * 1024)).toBe('2.0 PB');
    });

    it('should have various precision', () => {
      expect(bytesFilter(2)).toBe('2.0 bytes');
      expect(bytesFilter(2.1)).toBe('2.1 bytes');
      expect(bytesFilter(2.11)).toBe('2.1 bytes');
      expect(bytesFilter(2.11, 2)).toBe('2.11 bytes');
      expect(bytesFilter(2.11, 0)).toBe('2 bytes');
    });

    describe('RelativeTimeFilter', () => {
      const relativeTimeFilter: RelativeTimeFilterFunction = $filter('relativetime');
      it('should initialize correctly', () => {
        expect(relativeTimeFilter).toBeDefined();
      });

      it('should deal with various undefined', () => {
        expect(relativeTimeFilter()).toBe('a few seconds ago');
        expect(relativeTimeFilter(undefined)).toBe('a few seconds ago');
        expect(relativeTimeFilter('')).toBe('');
      });
    });

    describe('EncodeURIFilter', () => {
      const encodeURIFilter = $filter<EncodeURIFilterFunction>('encodeURI');
      it('should handle empty or undefined input', () => {
        expect(encodeURIFilter('')).toBe((''));
        expect(encodeURIFilter(undefined)).toBe((''));
      });

      it('behaves like window.encodeURIComponent', () => {
        expect(encodeURIFilter('hello world')).toBe(('hello%20world'));
        expect(encodeURIFilter('abcdefg')).toBe(('abcdefg'));
        expect(encodeURIFilter('<html>')).toBe(('%3Chtml%3E'));
      });
    });
  });
});
