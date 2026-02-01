/**
 * Compute percentile bands from simulation paths at each year
 * @param {Array<Array<number>>} paths - 10,000 arrays, each of length (years+1)
 * @param {number} years - time horizon
 * @returns {Array<Object>} - Array of { year, p5, p25, p50, p75, p95, mean }
 */
export function computeTimeSeriesBands(paths, years) {
  const numSims = paths.length;
  const bands = new Array(years + 1);

  for (let y = 0; y <= years; y++) {
    const values = new Array(numSims);
    for (let i = 0; i < numSims; i++) {
      values[i] = paths[i][y];
    }
    values.sort((a, b) => a - b);

    let sum = 0;
    for (let i = 0; i < numSims; i++) {
      sum += values[i];
    }

    bands[y] = {
      year: y,
      p5: values[Math.floor(numSims * 0.05)],
      p25: values[Math.floor(numSims * 0.25)],
      p50: values[Math.floor(numSims * 0.50)],
      p75: values[Math.floor(numSims * 0.75)],
      p95: values[Math.floor(numSims * 0.95)],
      mean: sum / numSims
    };
  }

  return bands;
}
