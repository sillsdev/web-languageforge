import * as angular from 'angular';

import '../../../bellows/core/core.module';
import '../../../bellows/core/error.service';
import '../../../bellows/core/notice/notice.service';
import {SfChecksCoreModule, SortData} from './sf-checks-core.module';

interface UnsortedTestData {
  name: string;
  address: string;
}

describe('Sorting: ', () => {
  let sorting: any;

  beforeEach(() => {
      angular.mock.module(SfChecksCoreModule);
  });

  // noinspection TsLint
  beforeEach(angular.mock.inject((_listviewSortingService_: any) => {
      sorting = _listviewSortingService_;
  }));

  it('should flip directions correctly', () => {
    expect(sorting.flipDirection('up')).toBe('down');
    expect(sorting.flipDirection('down')).toBe('up');
  });

  it('should default to sorting "upwards" when a column is first selected', () => {
    const sortData: SortData = { direction: undefined, sortColumn: undefined };
    sorting.setSortColumn(sortData, 'name');
    expect(sortData.sortColumn).toBe('name');
    expect(sortData.direction).toBe('up');
  });

  it('should flip to sorting "downwards" when a column is selected a second time', () => {
    const sortData: SortData = { direction: undefined, sortColumn: undefined };
    sorting.setSortColumn(sortData, 'name');
    expect(sortData.sortColumn).toBe('name');
    expect(sortData.direction).toBe('up');
    sorting.setSortColumn(sortData, 'name');
    expect(sortData.sortColumn).toBe('name');
    expect(sortData.direction).toBe('down');
  });

  describe('should sort "upwards" when a new column is selected, no matter the direction of the previous ' +
    'column', () => {
    it('previous column was sorting upwards', () => {
      const sortData: SortData = { direction: undefined, sortColumn: undefined };
      sorting.setSortColumn(sortData, 'name');
      expect(sortData.sortColumn).toBe('name');
      expect(sortData.direction).toBe('up');
      sorting.setSortColumn(sortData, 'date');
      expect(sortData.sortColumn).toBe('date');
      expect(sortData.direction).toBe('up');
    });
    it('previous column was sorting downwards', () => {
      const sortData: SortData = { direction: undefined, sortColumn: undefined };
      sorting.setSortColumn(sortData, 'name');
      expect(sortData.sortColumn).toBe('name');
      expect(sortData.direction).toBe('up');
      sorting.setSortColumn(sortData, 'name');
      expect(sortData.sortColumn).toBe('name');
      expect(sortData.direction).toBe('down');
      sorting.setSortColumn(sortData, 'date');
      expect(sortData.sortColumn).toBe('date');
      expect(sortData.direction).toBe('up');
    });
  });

  it('should provide appropriate Font Awesome icon class names for easy UI integration', () => {
    const sortData: SortData = { direction: undefined, sortColumn: undefined };
    // "Neutral" sort icon when no column set
    expect(sorting.sortIconClass(sortData, 'name')).toBe('fa fa-sort');
    // Setting sort column gives "up" sort icon
    sorting.setSortColumn(sortData, 'name');
    expect(sorting.sortIconClass(sortData, 'name')).toBe('fa fa-sort-up');
    // Setting sort column second time gives "down" sort icon
    sorting.setSortColumn(sortData, 'name');
    expect(sorting.sortIconClass(sortData, 'name')).toBe('fa fa-sort-down');
    // Setting a different sort column causes the "name" column to go back to the "neutral" sort icon
    sorting.setSortColumn(sortData, 'date');
    expect(sorting.sortIconClass(sortData, 'name')).toBe('fa fa-sort');
  });

  it('should sort data by the requested columns', () => {
    const sortData: SortData = { direction: undefined, sortColumn: undefined };
    const dataUnsorted: UnsortedTestData[] = [
      { name: 'Sherlock Holmes', address: '221B Baker St.' },
      { name: 'John Watson', address: '380 Globe Ln.' },
      { name: 'Mycroft Holmes', address: '123 Main St.' }
    ];
    const dataByName: UnsortedTestData[] = [
      { name: 'John Watson', address: '380 Globe Ln.' },
      { name: 'Mycroft Holmes', address: '123 Main St.' },
      { name: 'Sherlock Holmes', address: '221B Baker St.' }
    ];
    const dataByAddress: UnsortedTestData[] = [
      { name: 'Mycroft Holmes', address: '123 Main St.' },
      { name: 'Sherlock Holmes', address: '221B Baker St.' },
      { name: 'John Watson', address: '380 Globe Ln.' }
    ];

    const data: UnsortedTestData[] = dataUnsorted;

    // Before calling the sort function, data is in its unsorted state
    expect(data).toEqual(dataUnsorted);
    // Sorting sorts in-place
    sorting.setSortColumn(sortData, 'name');
    sorting.sortDataByColumn(data, sortData.sortColumn, sortData.direction);
    expect(data).toEqual(dataByName);
    // Sorting again on the same column should produce it in reverse order
    sorting.setSortColumn(sortData, 'name');
    sorting.sortDataByColumn(data, sortData.sortColumn, sortData.direction);
    expect(data.reverse()).toEqual(dataByName);
    // Sorting on a different column produces the data in ascending order again
    sorting.setSortColumn(sortData, 'address');
    sorting.sortDataByColumn(data, sortData.sortColumn, sortData.direction);
    expect(data).toEqual(dataByAddress);
  });
});
