/**
 * Submission state of a setting element in component.
 * e.g. is it being submitted, or was submitted succesfully.
 */
export enum ElementState {
  /** Identical to what is believed to be in the database. */
  InSync = 'InSync',
  /** Different than what is believed to be in the database.
   *  Not to be confused with an input control claiming to be 'dirty', which might still actually be InSync. */
  Dirty = 'Dirty',
  /** Pending a write to the database. */
  Submitting = 'Submitting',
  /** InSync and was written to the database since last Dirty. */
  Submitted = 'Submitted',
  /** There was an error attempting to submit. */
  Error = 'Error',
  /** The data is invalid. */
  Invalid = 'Invalid'
}
