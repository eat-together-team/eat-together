// Compact "how long ago" label for notification rows — "3m", "5h", "1d".
// moment's own fromNow(true) gives prose ("a day", "3 minutes"), which is too
// long for the trailing slot next to the Accept button, so this formats the
// short form the design calls for instead.
//
// Accepts whatever the source happens to store, since the three notification
// sources all differ: a Firestore Timestamp (invite docs), a unix seconds
// number (chat messages, see ChatPreview.js), a millisecond epoch (connection
// requests store Date.now()), or a plain Date.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = 365 * DAY;

/**
 * Normalizes any of the timestamp shapes the notification sources use into
 * milliseconds since epoch, or null if the value isn't a usable time.
 * @param {*} value A Firestore Timestamp, Date, or numeric epoch.
 * @returns {number|null} Milliseconds since epoch, or null.
 */
const toMillis = (value) => {
  if (value == null || value === "") return null;

  // Firestore Timestamp
  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return isNaN(date.getTime()) ? null : date.getTime();
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.getTime();
  }

  if (typeof value === "number") {
    if (!isFinite(value)) return null;
    // Seconds vs milliseconds: anything below this threshold can't plausibly
    // be a millisecond epoch (it'd be 1970), so treat it as unix seconds —
    // which is what the chat sources store via moment().unix().
    return value < 1e11 ? value * 1000 : value;
  }

  return null;
};

/**
 * Formats a timestamp as a compact relative label.
 * @param {*} value A Firestore Timestamp, Date, or numeric epoch.
 * @param {Date} [now] Reference point, for testing.
 * @returns {string} e.g. "now", "3m", "5h", "1d", "2w", "1y" — "" if unusable.
 */
const formatRelativeTime = (value, now = new Date()) => {
  const millis = toMillis(value);
  if (millis === null) return "";

  // A clock skew (or an event dated slightly ahead) shouldn't render as a
  // negative age — clamp to "now" rather than showing "-1m".
  const elapsed = Math.max(0, now.getTime() - millis);

  if (elapsed < MINUTE) return "now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`;
  if (elapsed < WEEK) return `${Math.floor(elapsed / DAY)}d`;
  if (elapsed < YEAR) return `${Math.floor(elapsed / WEEK)}w`;
  return `${Math.floor(elapsed / YEAR)}y`;
};

export default formatRelativeTime;
