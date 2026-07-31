const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now" / "2 hours ago" / "yesterday" / "3 days ago" / a plain date. */
export const relativeTime = (value) => {
  if (!value) return null;
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return null;

  const diff = Date.now() - then;
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(diff / DAY);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(value).toLocaleDateString();
};

export default relativeTime;
