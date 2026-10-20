/** Opens a progression step ({ type: 'lesson' | 'challenge', ... }); no step means the map. */
export function goToStep(nav, step) {
  if (step?.type === 'lesson') return nav.go('lesson', { faseId: step.faseId });
  if (step?.type === 'challenge') return nav.go('challenge', { challengeId: step.challengeId });
  return nav.go('map');
}
