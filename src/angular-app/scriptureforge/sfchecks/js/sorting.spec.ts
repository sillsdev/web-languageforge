import * as angular from 'angular';

import '../../../bellows/core/core.module';
import '../../../bellows/core/error.service';
import '../../../bellows/core/notice/notice.service';
import './services';

describe('Sorting: ', () => {
  let sorting: any;

  beforeEach(() => {
      angular.mock.module('sfchecks.services');
  });

  // beforeEach(() => {
  //     module('sfchecks.services');
  // });

  // noinspection TsLint
  beforeEach(angular.mock.inject((_listviewSortingService_: any) => {
      sorting = _listviewSortingService_;
  }));

  it('should flip directions correctly', () => {
    expect(sorting.flipDirection('up')).toBe('down');
    expect(sorting.flipDirection('down')).toBe('up');
  });

  it('should default to sorting "upwards" when a column is first selected', () => {
    const sortdata: any = { direction: undefined, sortColumn: undefined };
    sorting.setSortColumn(sortdata, 'name');
    expect(sortdata.sortColumn).toBe('name');
    expect(sortdata.direction).toBe('up');
  });

  it('should flip to sorting "downwards" when a column is selected a second time', () => {
    const sortdata: any = { direction: undefined, sortColumn: undefined };
    sorting.setSortColumn(sortdata, 'name');
    expect(sortdata.sortColumn).toBe('name');
    expect(sortdata.direction).toBe('up');
    sorting.setSortColumn(sortdata, 'name');
    expect(sortdata.sortColumn).toBe('name');
    expect(sortdata.direction).toBe('down');
  });

  describe('should sort "upwards" when a new column is selected, no matter the direction of the previous ' +
    'column', () => {
    it('previous column was sorting upwards', () => {
      const sortdata: any = { direction: undefined, sortColumn: undefined };
      sorting.setSortColumn(sortdata, 'name');
      expect(sortdata.sortColumn).toBe('name');
      expect(sortdata.direction).toBe('up');
      sorting.setSortColumn(sortdata, 'date');
      expect(sortdata.sortColumn).toBe('date');
      expect(sortdata.direction).toBe('up');
    });
    it('previous column was sorting downwards', () => {
      const sortdata: any = { direction: undefined, sortColumn: undefined };
      sorting.setSortColumn(sortdata, 'name');
      expect(sortdata.sortColumn).toBe('name');
      expect(sortdata.direction).toBe('up');
      sorting.setSortColumn(sortdata, 'name');
      expect(sortdata.sortColumn).toBe('name');
      expect(sortdata.direction).toBe('down');
      sorting.setSortColumn(sortdata, 'date');
      expect(sortdata.sortColumn).toBe('date');
      expect(sortdata.direction).toBe('up');
    });
  });

  it('should provide appropriate Font Awesome icon class names for easy UI integration', () => {
    const sortdata: any = { direction: undefined, sortColumn: undefined };
    // "Neutral" sort icon when no column set
    expect(sorting.sortIconClass(sortdata, 'name')).toBe('fa fa-sort');
    // Setting sort column gives "up" sort icon
    sorting.setSortColumn(sortdata, 'name');
    expect(sorting.sortIconClass(sortdata, 'name')).toBe('fa fa-sort-up');
    // Setting sort column second time gives "down" sort icon
    sorting.setSortColumn(sortdata, 'name');
    expect(sorting.sortIconClass(sortdata, 'name')).toBe('fa fa-sort-down');
    // Setting a different sort column causes the "name" column to go back to the "neutral" sort icon
    sorting.setSortColumn(sortdata, 'date');
    expect(sorting.sortIconClass(sortdata, 'name')).toBe('fa fa-sort');
  });

  it('should sort data by the requested columns', () => {
    const sortdata: any = { direction: undefined, sortColumn: undefined };
    const dataUnsorted: any = [
      { name: 'Sherlock Holmes', address: '221B Baker St.' },
      { name: 'John Watson', address: '380 Globe Ln.' },
      { name: 'Mycroft Holmes', address: '123 Main St.' }
    ];
    const dataByName: any = [
      { name: 'John Watson', address: '380 Globe Ln.' },
      { name: 'Mycroft Holmes', address: '123 Main St.' },
      { name: 'Sherlock Holmes', address: '221B Baker St.' }
    ];
    const dataByAddress: any = [
      { name: 'Mycroft Holmes', address: '123 Main St.' },
      { name: 'Sherlock Holmes', address: '221B Baker St.' },
      { name: 'John Watson', address: '380 Globe Ln.' }
    ];

    const data: any = dataUnsorted;

    // Before calling the sort function, data is in its unsorted state
    expect(data).toEqual(dataUnsorted);
    // Sorting sorts in-place
    sorting.setSortColumn(sortdata, 'name');
    sorting.sortDataByColumn(data, sortdata.sortColumn, sortdata.direction);
    expect(data).toEqual(dataByName);
    // Sorting again on the same column should produce it in reverse order
    sorting.setSortColumn(sortdata, 'name');
    sorting.sortDataByColumn(data, sortdata.sortColumn, sortdata.direction);
    expect(data.reverse()).toEqual(dataByName);
    // Sorting on a different column produces the data in ascending order again
    sorting.setSortColumn(sortdata, 'address');
    sorting.sortDataByColumn(data, sortdata.sortColumn, sortdata.direction);
    expect(data).toEqual(dataByAddress);
  });
});
