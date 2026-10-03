import { toIso } from "../model/engine";

/** "Today" for planning, in Gulf Standard Time (UTC+4), so dates flip at local midnight. */
export function gulfToday(now = Date.now()) {
  return toIso(new Date(now + 4 * 3600 * 1000));
}
