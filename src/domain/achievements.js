/**
 * Achievements are data: `{ id, title, description, icon, test(progress, ctx) }`.
 * Returns the definitions that just became true.
 */
export function newlyUnlockedAchievements(progress, definitions, context) {
  return definitions.filter((def) => !progress.achievements.includes(def.id) && def.test(progress, context));
}
