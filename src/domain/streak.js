/** Daily streak ("sequência de dias") from SPEC-005. Days are local-calendar keys. */
const pad = (n) => String(n).padStart(2, '0');

export function dayKey(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function previousDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d - 1).getTime());
}

export function registerActivity(streak, today) {
  if (streak.lastDay === today) return streak;
  if (streak.lastDay === previousDayKey(today)) return { count: streak.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}

/** What the HUD shows: a streak that was not continued yesterday is already lost. */
export function visibleStreak(streak, today) {
  if (!streak.lastDay) return 0;
  return streak.lastDay === today || streak.lastDay === previousDayKey(today) ? streak.count : 0;
}
