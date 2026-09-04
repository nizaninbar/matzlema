/**
 * Today's date as YYYY-MM-DD in the *local* timezone.
 *
 * The obvious `new Date().toISOString().slice(0, 10)` is UTC, not local. In
 * Israel (UTC+2/+3) that stamps a report opened before 02:00/03:00 local time
 * with yesterday's date - a wrong date on a professional inspection document.
 *
 * Built from the local getters rather than by shifting a UTC timestamp, so
 * there is no offset arithmetic to get backwards.
 */
export function todayISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
