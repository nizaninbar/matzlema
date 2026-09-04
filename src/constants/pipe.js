// Domain vocabulary for pipeline inspection reports.
//
// These lists were previously written out twice - once in SectionForm, once in
// SectionList - which let the two panes drift apart. Anything the operator can
// choose belongs here, so both panes are guaranteed to offer the same options.

/**
 * Standard pipe diameters in mm.
 *
 * Offered as *suggestions*, not a closed set: the field is a text input backed
 * by a <datalist>. Inspectors do meet nonstandard sizes in the field, and the
 * section list already allowed free text, so restricting it to a <select> would
 * be a regression. This also retires the old "אחר" option, which stored the
 * literal sentinel '*' and printed it into the report as-is.
 */
export const DIAMETERS = [
  '110',
  '160',
  '200',
  '225',
  '250',
  '300',
  '315',
  '335',
  '400',
  '450',
  '500',
  '600',
  '800',
  '1000',
  '1250',
]

/** Pipe materials. A closed set - 'אחר' covers anything unlisted. */
export const PIPE_TYPES = ['PVC', 'פוליאתילן', 'פיברגלס', 'פלדה', 'אסבסט', 'פלדקס', 'בטון', 'אחר']

/** Which way the camera travelled through the section. */
export const DIRECTIONS = ['מורד הקו', 'מעלה הקו']

/** What the inspected line carries. Report-level, not per-section. */
export const PIPE_PURPOSES = ['מים', 'ביוב', 'ניקוז', 'השחלה']

/** Starting values for a new section in the add-section form. */
export const SECTION_DEFAULTS = {
  pipeType: 'PVC',
  direction: 'מורד הקו',
  description: 'תקין',
}

/** Starting value for a new report's pipe purpose. */
export const DEFAULT_PIPE_PURPOSE = 'ביוב'
