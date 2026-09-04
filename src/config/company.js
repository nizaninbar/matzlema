// Company and certified-photographer details printed on every report.
//
// These were hard-coded into SectionList's template, so a phone number or a
// change of operator meant editing a component and redeploying. Keeping them
// here makes that a one-line edit, and is the seam a second certified operator
// would be added through.

import logo from '../assets/mazlema.png'
import signature from '../assets/sig.jpg'

export const COMPANY = {
  photographer: 'דוד כהן',
  certificateNumber: '23774',
  address: 'הירדן 2, מושב ישרש',
  postalCode: '76838',
  phone: '054-6655305',
  fax: '08-6168321',
  email: 'office@matzlema.co.il',
  vatId: '035920024',
  logo,
  signature,
}

/**
 * The letterhead block, in print order. Rendered as label/value rows, so
 * reordering or adding a line is done here rather than in the template.
 */
export const COMPANY_DETAIL_ROWS = [
  { label: 'צלם מוסמך', value: COMPANY.photographer },
  { label: "מס' תעודה", value: COMPANY.certificateNumber },
  { label: 'כתובת', value: COMPANY.address },
  { label: 'מיקוד', value: COMPANY.postalCode },
  { label: "טל'", value: COMPANY.phone },
  { label: 'טלפקס', value: COMPANY.fax },
  { label: 'דוא"ל', value: COMPANY.email },
  { label: 'ע.מ', value: COMPANY.vatId },
]
