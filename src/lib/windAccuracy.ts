export type WindAccuracyValues = {
  speedKmh: number;
  direction: number;
  gustsKmh?: number;
};

export type WindAccuracyTolerance = {
  speedKmh: number;
  directionDegrees: number;
  gustsKmh: number;
};

export type WindAccuracyDelta = {
  speedKmh: number;
  directionDegrees: number;
  gustsKmh: number | null;
  passed: boolean;
};

export type WindAccuracySummary = {
  samples: number;
  passed: boolean;
  meanSpeedDeltaKmh: number;
  maxSpeedDeltaKmh: number;
  meanDirectionDeltaDegrees: number;
  maxDirectionDeltaDegrees: number;
  meanGustDeltaKmh: number | null;
  maxGustDeltaKmh: number | null;
};

/**
 * The point API rounds speed to 0.1 km/h and direction to whole degrees. These
 * tolerances allow that display rounding while still catching a wrong model,
 * timestep, unit conversion, vector sign or interpolation implementation.
 */
export const DEFAULT_WIND_ACCURACY_TOLERANCE: WindAccuracyTolerance = {
  speedKmh: 0.15,
  directionDegrees: 1,
  gustsKmh: 0.15,
};

export function circularDirectionDelta(
  firstDegrees: number,
  secondDegrees: number,
): number {
  if (!Number.isFinite(firstDegrees) || !Number.isFinite(secondDegrees)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.abs(
    ((((firstDegrees - secondDegrees) % 360) + 540) % 360) - 180,
  );
}

export function compareWindAccuracy(
  rendered: WindAccuracyValues,
  reference: WindAccuracyValues,
  tolerance = DEFAULT_WIND_ACCURACY_TOLERANCE,
): WindAccuracyDelta {
  const speedKmh = Math.abs(rendered.speedKmh - reference.speedKmh);
  const directionDegrees = circularDirectionDelta(
    rendered.direction,
    reference.direction,
  );
  const gustsComparable =
    Number.isFinite(rendered.gustsKmh) && Number.isFinite(reference.gustsKmh);
  const gustsKmh = gustsComparable
    ? Math.abs(rendered.gustsKmh! - reference.gustsKmh!)
    : null;

  return {
    speedKmh,
    directionDegrees,
    gustsKmh,
    passed:
      Number.isFinite(speedKmh) &&
      speedKmh <= tolerance.speedKmh &&
      directionDegrees <= tolerance.directionDegrees &&
      (gustsKmh === null || gustsKmh <= tolerance.gustsKmh),
  };
}

export function summarizeWindAccuracy(
  deltas: readonly WindAccuracyDelta[],
): WindAccuracySummary {
  if (deltas.length === 0) {
    return {
      samples: 0,
      passed: false,
      meanSpeedDeltaKmh: Number.POSITIVE_INFINITY,
      maxSpeedDeltaKmh: Number.POSITIVE_INFINITY,
      meanDirectionDeltaDegrees: Number.POSITIVE_INFINITY,
      maxDirectionDeltaDegrees: Number.POSITIVE_INFINITY,
      meanGustDeltaKmh: null,
      maxGustDeltaKmh: null,
    };
  }

  const gustDeltas = deltas.flatMap(({ gustsKmh }) =>
    gustsKmh === null ? [] : [gustsKmh],
  );
  const average = (values: readonly number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    samples: deltas.length,
    passed: deltas.every(({ passed }) => passed),
    meanSpeedDeltaKmh: average(deltas.map(({ speedKmh }) => speedKmh)),
    maxSpeedDeltaKmh: Math.max(...deltas.map(({ speedKmh }) => speedKmh)),
    meanDirectionDeltaDegrees: average(
      deltas.map(({ directionDegrees }) => directionDegrees),
    ),
    maxDirectionDeltaDegrees: Math.max(
      ...deltas.map(({ directionDegrees }) => directionDegrees),
    ),
    meanGustDeltaKmh: gustDeltas.length ? average(gustDeltas) : null,
    maxGustDeltaKmh: gustDeltas.length ? Math.max(...gustDeltas) : null,
  };
}
