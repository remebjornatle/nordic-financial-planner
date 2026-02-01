/**
 * Norwegian Tax Calculator
 * Handles capital gains tax calculations according to Norwegian tax law
 */

export class TaxCalculator {
  // Norwegian tax rates (as of 2024)
  static CAPITAL_GAINS_RATE = 0.3784;  // 37.84% effective rate
  static STEP_UP_FACTOR = 1.72;         // Step-up factor for gains
  static FLAT_RATE = 0.22;              // Flat tax rate (22%)

  /**
   * Calculate tax on stock capital gains
   * Norwegian system: Gains × 1.72 × 22% = 37.84% effective rate
   *
   * @param {number} totalValue - Final portfolio value
   * @param {number} costBasis - Total amount invested
   * @returns {number} - Tax owed
   */
  static calculateCapitalGainsTax(totalValue, costBasis) {
    const capitalGains = Math.max(0, totalValue - costBasis);

    // Method 1: Direct calculation (37.84%)
    const tax = capitalGains * this.CAPITAL_GAINS_RATE;

    return tax;
  }

  /**
   * Alternative calculation using step-up method
   * Mathematically equivalent to direct method
   *
   * @param {number} totalValue - Final portfolio value
   * @param {number} costBasis - Total amount invested
   * @returns {number} - Tax owed
   */
  static calculateCapitalGainsTaxStepUp(totalValue, costBasis) {
    const capitalGains = Math.max(0, totalValue - costBasis);

    // Method 2: Step-up method
    const steppedUpGains = capitalGains * this.STEP_UP_FACTOR;
    const tax = steppedUpGains * this.FLAT_RATE;

    return tax;
  }

  /**
   * Calculate after-tax value of investment
   *
   * @param {number} totalValue - Final portfolio value
   * @param {number} costBasis - Total amount invested
   * @returns {number} - After-tax value
   */
  static calculateAfterTaxValue(totalValue, costBasis) {
    const tax = this.calculateCapitalGainsTax(totalValue, costBasis);
    return totalValue - tax;
  }

  /**
   * Calculate effective tax rate on gains
   *
   * @param {number} totalValue - Final portfolio value
   * @param {number} costBasis - Total amount invested
   * @returns {number} - Effective tax rate (0-1)
   */
  static calculateEffectiveTaxRate(totalValue, costBasis) {
    const capitalGains = Math.max(0, totalValue - costBasis);

    if (capitalGains === 0) {
      return 0;
    }

    const tax = this.calculateCapitalGainsTax(totalValue, costBasis);
    return tax / capitalGains;
  }

  /**
   * Calculate shielding deduction (simplified version)
   * Note: This is a simplified calculation. Full implementation would track
   * yearly shielding based on risk-free rate.
   *
   * Shielding reduces taxable gains based on risk-free rate of return
   * For MVP, this is not implemented but included for future enhancement
   *
   * @param {number} costBasis - Total amount invested
   * @param {number} years - Investment period in years
   * @param {number} riskFreeRate - Risk-free rate (e.g., 0.039 for 3.9%)
   * @returns {number} - Total shielding deduction
   */
  static calculateShielding(costBasis, years, riskFreeRate = 0.039) {
    // Simplified: assumes constant cost basis
    // Actual implementation would track yearly basis changes
    return costBasis * riskFreeRate * years;
  }
}
