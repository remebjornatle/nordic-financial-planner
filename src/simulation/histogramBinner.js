/**
 * Histogram Binning using Freedman-Diaconis Rule
 * Optimized for efficiently displaying 10,000 Monte Carlo simulation results
 */

export class HistogramBinner {
  /**
   * Bin data into histogram buckets
   * @param {Array<number>} data - Raw simulation outcomes (typically 10,000 values)
   * @param {number} numBins - Optional: specify number of bins (default: auto-calculate)
   * @returns {Array<Object>} - Binned data ready for Recharts visualization
   */
  static binData(data, numBins = null) {
    if (!data || data.length === 0) {
      return [];
    }

    // Sort data once for percentile calculations and binning
    const sortedData = [...data].sort((a, b) => a - b);

    // Calculate optimal number of bins if not specified
    if (numBins === null) {
      numBins = this.calculateOptimalBins(sortedData);
    }

    const min = sortedData[0];
    const max = sortedData[sortedData.length - 1];

    // Handle edge case where all values are the same
    if (min === max) {
      return [{
        binStart: min,
        binEnd: max,
        count: data.length,
        midpoint: min,
        percentage: 100
      }];
    }

    const binWidth = (max - min) / numBins;

    // Initialize bins
    const bins = new Array(numBins);
    for (let i = 0; i < numBins; i++) {
      bins[i] = {
        binStart: min + i * binWidth,
        binEnd: min + (i + 1) * binWidth,
        count: 0,
        midpoint: min + (i + 0.5) * binWidth
      };
    }

    // Count data points in each bin
    for (let value of sortedData) {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        numBins - 1  // Last bin includes max value
      );
      bins[binIndex].count++;
    }

    // Add percentage for each bin
    const totalCount = data.length;
    bins.forEach(bin => {
      bin.percentage = (bin.count / totalCount) * 100;
    });

    return bins;
  }

  /**
   * Calculate optimal number of bins using Freedman-Diaconis rule
   * This rule is robust to outliers and works well for skewed distributions
   *
   * Formula: binWidth = 2 × IQR / n^(1/3)
   * where IQR = Q3 - Q1 (Interquartile Range)
   *
   * @param {Array<number>} sortedData - Pre-sorted data array
   * @returns {number} - Optimal number of bins (constrained to 20-60 range)
   */
  static calculateOptimalBins(sortedData) {
    const n = sortedData.length;

    // Calculate quartiles
    const q1 = sortedData[Math.floor(n * 0.25)];
    const q3 = sortedData[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    // Freedman-Diaconis rule for bin width
    const binWidth = (2 * iqr) / Math.pow(n, 1 / 3);

    // Calculate number of bins
    const range = sortedData[n - 1] - sortedData[0];
    const numBins = binWidth > 0 ? Math.ceil(range / binWidth) : 30;

    // Constrain to reasonable range (20-60 bins for visualization)
    return Math.max(20, Math.min(60, numBins));
  }

  /**
   * Calculate percentiles efficiently from sorted data
   * @param {Array<number>} data - Unsorted data array
   * @returns {Object} - Percentiles {p5, p25, p50, p75, p95}
   */
  static calculatePercentiles(data) {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;

    return {
      p5: sorted[Math.floor(n * 0.05)],
      p25: sorted[Math.floor(n * 0.25)],
      p50: sorted[Math.floor(n * 0.50)],  // Median
      p75: sorted[Math.floor(n * 0.75)],
      p95: sorted[Math.floor(n * 0.95)]
    };
  }

  /**
   * Calculate comprehensive statistics for simulation results
   * @param {Array<number>} data - Simulation results
   * @returns {Object} - Statistics including mean, median, std dev, etc.
   */
  static calculateStatistics(data) {
    if (!data || data.length === 0) {
      return null;
    }

    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;

    // Mean
    const mean = data.reduce((sum, val) => sum + val, 0) / n;

    // Standard deviation
    const squareDiffs = data.map(val => Math.pow(val - mean, 2));
    const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / n;
    const stdDev = Math.sqrt(variance);

    // Percentiles
    const percentiles = this.calculatePercentiles(data);

    return {
      mean,
      median: percentiles.p50,
      stdDev,
      min: sorted[0],
      max: sorted[n - 1],
      ...percentiles
    };
  }

  /**
   * Calculate probability that one scenario outperforms another
   * @param {Array<number>} data1 - First scenario results
   * @param {Array<number>} data2 - Second scenario results
   * @returns {number} - Probability (0-1) that data1 > data2
   */
  static calculateOutperformanceProbability(data1, data2) {
    if (data1.length !== data2.length) {
      throw new Error('Data arrays must have equal length');
    }

    let wins = 0;
    for (let i = 0; i < data1.length; i++) {
      if (data1[i] > data2[i]) {
        wins++;
      }
    }

    return wins / data1.length;
  }
}
