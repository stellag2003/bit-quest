/** Energy ("vidas") rules from SPEC-005. All functions are pure; `now` is injected. */
export const ENERGY_MAX = 5;
export const ENERGY_REGEN_MS = 2 * 60 * 1000;

export function currentEnergy(energy, now) {
  if (energy.value >= ENERGY_MAX) return { value: ENERGY_MAX, updatedAt: now };
  const gained = Math.floor(Math.max(0, now - energy.updatedAt) / ENERGY_REGEN_MS);
  if (gained === 0) return { ...energy };
  const value = Math.min(ENERGY_MAX, energy.value + gained);
  return { value, updatedAt: value >= ENERGY_MAX ? now : energy.updatedAt + gained * ENERGY_REGEN_MS };
}

export function spendEnergy(energy, now) {
  const current = currentEnergy(energy, now);
  if (current.value <= 0) throw new Error('Sem energia');
  // Regeneration starts counting from the moment the bar stops being full.
  const updatedAt = current.value === ENERGY_MAX ? now : current.updatedAt;
  return { value: current.value - 1, updatedAt };
}

export function gainEnergy(energy, now, amount = 1) {
  const current = currentEnergy(energy, now);
  const value = Math.min(ENERGY_MAX, current.value + amount);
  return { value, updatedAt: value >= ENERGY_MAX ? now : current.updatedAt };
}

export function msUntilNextEnergy(energy, now) {
  const current = currentEnergy(energy, now);
  return current.value >= ENERGY_MAX ? 0 : ENERGY_REGEN_MS - (now - current.updatedAt);
}

export const fullEnergy = (now) => ({ value: ENERGY_MAX, updatedAt: now });
