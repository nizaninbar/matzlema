// Report-level defaults. Kept out of the components because each of these was
// previously written twice - once where the ref is created, once again as the
// fallback in the JSON loader - so the two could silently diverge.

/**
 * Opening line of the closing summary. The operator continues the numbered list
 * from here, so the trailing newline is deliberate.
 */
export const DEFAULT_SUMMARY_TEXT = '2. הקטעים שצולמו\n'

/** A report with no number yet. */
export const DEFAULT_REPORT_NUMBER = 0
