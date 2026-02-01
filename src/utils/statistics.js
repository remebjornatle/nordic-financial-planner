/**
 * Statistical Utility Functions
 * Helper functions for calculating statistics on simulation results
 */

export class Statistics {
  /**
   * Calculate percentile from sorted array
   * @param {Array<number>} sortedArray - Pre-sorted array
   * @param {number} p - Percentile (0-1, e.g., 0.95 for 95th percentile)
   * @returns {number} - Value at percentile
   */
  static percentile(sortedArray, p) {
    if (sortedArray.length === 0) return 0;

    const index = Math.floor(sortedArray.length * p);
    return sortedArray[Math.min(index, sortedArray.length - 1)];
  }

  /**
   * Calculate mean (average)
   * @param {Array<number>} array - Data array
   * @returns {number} - Mean value
   */
  static mean(array) {
    if (array.length === 0) return 0;
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }

  /**
   * Calculate median (50th percentile)
   * @param {Array<number>} array - Data array
   * @returns {number} - Median value
   */
  static median(array) {
    if (array.length === 0) return 0;

    const sorted = [...array].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  /**
   * Calculate standard deviation
   * @param {Array<number>} array - Data array
   * @returns {number} - Standard deviation
   */
  static stdDev(array) {
    if (array.length === 0) return 0;

    const avg = this.mean(array);
    const squareDiffs = array.map(val => Math.pow(val - avg, 2));
    const avgSquareDiff = this.mean(squareDiffs);

    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Calculate variance
   * @param {Array<number>} array - Data array
   * @returns {number} - Variance
   */
  static variance(array) {
    if (array.length === 0) return 0;

    const avg = this.mean(array);
    const squareDiffs = array.map(val => Math.pow(val - avg, 2));

    return this.mean(squareDiffs);
  }

  /**
   * Calculate probability that one scenario outperforms another
   * @param {Array<number>} scenario1 - First scenario results
   * @param {Array<number>} scenario2 - Second scenario results
   * @returns {number} - Probability (0-1) that scenario1 > scenario2
   */
  static probabilityOutperforms(scenario1, scenario2) {
    if (scenario1.length !== scenario2.length) {
      throw new Error('Arrays must have equal length');
    }

    let wins = 0;
    for (let i = 0; i < scenario1.length; i++) {
      if (scenario1[i] > scenario2[i]) {
        wins++;
      }
    }

    return wins / scenario1.length;
  }

  /**
   * Format number as Norwegian currency
   * @param {number} value - Numeric value
   * @param {boolean} compact - Use compact notation (e.g., 1.5M)
   * @returns {string} - Formatted currency string
   */
  static formatNOK(value, compact = false) {
    if (compact && Math.abs(value) >= 1000000) {
      return new Intl.NumberFormat('no-NO', {
        style: 'currency',
        currency: 'NOK',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        notation: 'compact'
      }).format(value);
    }

    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Format number as percentage
   * @param {number} value - Numeric value (0-1 or 0-100)
   * @param {number} decimals - Number of decimal places
   * @param {boolean} isDecimal - If true, value is 0-1; if false, value is 0-100
   * @returns {string} - Formatted percentage string
   */
  static formatPercent(value, decimals = 1, isDecimal = true) {
    const percent = isDecimal ? value * 100 : value;
    return `${percent.toFixed(decimals)}%`;
  }

  /**
   * Calculate min and max from array
   * @param {Array<number>} array - Data array
   * @returns {Object} - {min, max}
   */
  static minMax(array) {
    if (array.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...array),
      max: Math.max(...array)
    };
  }

  /**
   * Calculate comprehensive summary statistics
   * @param {Array<number>} data - Data array
   * @returns {Object} - Statistics object
   */
  static summarize(data) {
    if (!data || data.length === 0) {
      return null;
    }

    const sorted = [...data].sort((a, b) => a - b);

    return {
      count: data.length,
      mean: this.mean(data),
      median: this.median(data),
      stdDev: this.stdDev(data),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p5: this.percentile(sorted, 0.05),
      p25: this.percentile(sorted, 0.25),
      p75: this.percentile(sorted, 0.75),
      p95: this.percentile(sorted, 0.95)
    };
  }
}
