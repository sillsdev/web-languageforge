/**
 * Traditionally Paratext stored selected sets of books as ascii strings of 1's and 0's. This class wraps this
 * representation to allow manipulating and iterating through this structure.
 *
 * Minimally converted from https://github.com/sillsdev/libpalaso/blob/master/SIL.Scripture/BookSet.cs
 */
export class BookSet {
  books?: string;
  firstSelectedBookNum?: number;
  lastSelectedBookNum?: number;
  count?: number;
  selectedBookNumbers?: number[];
  selectedBookIds?: string[];
}
