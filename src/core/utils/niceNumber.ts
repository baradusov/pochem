/**
 * "Nice" numbers people actually think in when estimating prices:
 * 1, 1.5, 2, 2.5, 3, 4, 5 … 9, 10, 15, 20 … and so on for every decade.
 */
const MANTISSAS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9];

/** Smallest reachable value is 0.1 */
const MIN_INDEX = -MANTISSAS.length;

const ladderValue = (index: number): number => {
  const decade = Math.floor(index / MANTISSAS.length);
  const mantissa = MANTISSAS[index - decade * MANTISSAS.length];
  return Math.round(mantissa * 10 ** decade * 100) / 100;
};

/** Index of the largest ladder value that is <= value */
const floorIndex = (value: number): number => {
  let index = Math.floor(Math.log10(value)) * MANTISSAS.length;
  while (ladderValue(index + 1) <= value) index++;
  while (ladderValue(index) > value) index--;
  return index;
};

/**
 * Moves `steps` positions along the nice-number ladder starting from `start`.
 * The first step from an off-ladder value lands on the nearest nice number
 * in that direction: stepNiceNumber(327, 1) → 400, stepNiceNumber(327, -1) → 300.
 * From zero the first step lands on `unit`: stepNiceNumber(0, 2, 100) → 150.
 */
export const stepNiceNumber = (
  start: number,
  steps: number,
  unit = 1
): number => {
  if (steps === 0) return start;
  if (start <= 0) {
    return steps > 0 ? ladderValue(floorIndex(unit) + steps - 1) : 0;
  }

  const lower = floorIndex(start);
  const isOnLadder = ladderValue(lower) === start;
  const base = steps > 0 || isOnLadder ? lower : lower + 1;

  return ladderValue(Math.max(MIN_INDEX, base + steps));
};

/** 3 → 1, 95 → 100, 1450 → 1000 */
export const nearestPowerOfTen = (value: number): number => {
  if (value <= 0) return 1;
  return 10 ** Math.round(Math.log10(value));
};
