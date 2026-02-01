/**
 * Monte Carlo Simulation Engine
 * Runs 10,000 simulations comparing stock investment vs mortgage paydown
 */

const NORWEGIAN_TAX_RATE = 0.3784; // 37.84% capital gains tax

export class MonteCarloEngine {
  constructor(historicalReturns) {
    this.returns = historicalReturns.annual_returns.map(r => r.return);
    this.meanReturn = historicalReturns.statistics.mean_return;
    this.stdDev = historicalReturns.statistics.std_deviation;
  }

  /**
   * Run complete simulation
   * @param {Object} params - Simulation parameters
   * @returns {Object} - Results for both scenarios
   */
  runSimulation(params) {
    const {
      monthlyInvestment,    // NOK per month
      timeHorizon,          // Years (5/10/15/20)
      mortgageRate,         // Annual rate (e.g., 0.045 for 4.5%)
      stockAllocation,      // 0-100
      numSimulations = 10000
    } = params;

    const stockResults = new Array(numSimulations);
    const mortgageResults = new Array(numSimulations);

    // Run simulations
    for (let i = 0; i < numSimulations; i++) {
      // Generate random return path using bootstrap sampling
      const returns = this.generateReturnPath(timeHorizon);

      // Calculate stock scenario (with tax and partial mortgage paydown)
      stockResults[i] = this.calculateStockScenario(
        monthlyInvestment,
        stockAllocation / 100,
        returns,
        mortgageRate,
        timeHorizon
      );

      // Calculate pure mortgage paydown scenario
      mortgageResults[i] = this.calculateMortgageScenario(
        monthlyInvestment,
        timeHorizon,
        mortgageRate
      );
    }

    return {
      stock: stockResults,
      mortgage: mortgageResults
    };
  }

  /**
   * Generate annual return path using historical bootstrap
   * Randomly samples from historical returns with replacement
   */
  generateReturnPath(years) {
    const path = new Array(years);
    for (let i = 0; i < years; i++) {
      // Bootstrap: randomly sample from historical returns
      const randomIndex = Math.floor(Math.random() * this.returns.length);
      path[i] = this.returns[randomIndex];
    }
    return path;
  }

  /**
   * Calculate stock investment scenario with Norwegian tax
   * Includes mortgage paydown for the non-stock allocation portion
   */
  calculateStockScenario(monthlyAmount, allocation, returns, mortgageRate, years) {
    let stockValue = 0;
    let totalInvested = 0;
    const monthlyToStock = monthlyAmount * allocation;
    const monthlyToMortgage = monthlyAmount * (1 - allocation);

    // Simulate year by year
    for (let year = 0; year < returns.length; year++) {
      const annualReturn = returns[year];

      // Add monthly contributions throughout the year (simplified: add at year start)
      const annualContribution = monthlyToStock * 12;
      stockValue += annualContribution;
      totalInvested += annualContribution;

      // Apply annual return
      stockValue *= (1 + annualReturn);
    }

    // Calculate capital gains and apply Norwegian tax
    const capitalGains = Math.max(0, stockValue - totalInvested);
    const tax = capitalGains * NORWEGIAN_TAX_RATE;
    const afterTaxStockValue = stockValue - tax;

    // Add mortgage savings from non-stock allocation
    const mortgageSavings = this.calculateMortgageSavingsValue(
      monthlyToMortgage,
      years,
      mortgageRate
    );

    return afterTaxStockValue + mortgageSavings;
  }

  /**
   * Calculate pure mortgage paydown scenario
   * Models the value of interest saved from extra payments
   */
  calculateMortgageScenario(monthlyAmount, years, mortgageRate) {
    return this.calculateMortgageSavingsValue(monthlyAmount, years, mortgageRate);
  }

  /**
   * Calculate the future value of mortgage interest savings
   *
   * Model: Each extra payment saves interest that would compound
   * The value grows at the mortgage rate (conservative assumption)
   *
   * Formula: FV = PMT × [(1 + r)^n - 1] / r
   * where r = monthly rate, n = total months, PMT = monthly payment
   */
  calculateMortgageSavingsValue(monthlyPayment, years, annualRate) {
    const monthlyRate = annualRate / 12;
    const totalMonths = years * 12;

    // Future value of annuity formula
    if (monthlyRate === 0) {
      // If rate is 0, simple multiplication
      return monthlyPayment * totalMonths;
    }

    const futureValue = monthlyPayment *
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

    return futureValue;
  }

  /**
   * Run simulation with year-by-year time series data
   * Returns both final values and intermediate portfolio values at each year
   */
  runSimulationWithTimeSeries(params) {
    const {
      monthlyInvestment,
      timeHorizon,
      mortgageRate,
      stockAllocation,
      numSimulations = 10000
    } = params;

    const stockResults = new Array(numSimulations);
    const mortgageResults = new Array(numSimulations);
    const stockPaths = new Array(numSimulations);

    for (let i = 0; i < numSimulations; i++) {
      const returns = this.generateReturnPath(timeHorizon);

      const { finalValue, yearlyValues } = this.calculateStockScenarioWithPath(
        monthlyInvestment,
        stockAllocation / 100,
        returns,
        mortgageRate,
        timeHorizon
      );

      stockResults[i] = finalValue;
      stockPaths[i] = yearlyValues;

      mortgageResults[i] = this.calculateMortgageScenario(
        monthlyInvestment,
        timeHorizon,
        mortgageRate
      );
    }

    const mortgagePath = this.calculateMortgagePath(
      monthlyInvestment,
      timeHorizon,
      mortgageRate
    );

    return {
      stock: stockResults,
      mortgage: mortgageResults,
      timeSeries: { stockPaths, mortgagePath }
    };
  }

  /**
   * Stock scenario that also returns yearly portfolio values
   * yearlyValues tracks the pre-tax stock portfolio at end of each year
   */
  calculateStockScenarioWithPath(monthlyAmount, allocation, returns, mortgageRate, years) {
    let stockValue = 0;
    let totalInvested = 0;
    const monthlyToStock = monthlyAmount * allocation;
    const monthlyToMortgage = monthlyAmount * (1 - allocation);

    const yearlyValues = new Array(years + 1);
    yearlyValues[0] = 0;

    for (let year = 0; year < returns.length; year++) {
      const annualContribution = monthlyToStock * 12;
      stockValue += annualContribution;
      totalInvested += annualContribution;
      stockValue *= (1 + returns[year]);
      yearlyValues[year + 1] = stockValue;
    }

    const capitalGains = Math.max(0, stockValue - totalInvested);
    const tax = capitalGains * NORWEGIAN_TAX_RATE;
    const afterTaxStockValue = stockValue - tax;

    const mortgageSavings = this.calculateMortgageSavingsValue(
      monthlyToMortgage,
      years,
      mortgageRate
    );

    return {
      finalValue: afterTaxStockValue + mortgageSavings,
      yearlyValues
    };
  }

  /**
   * Calculate deterministic mortgage value at each year
   */
  calculateMortgagePath(monthlyPayment, years, annualRate) {
    const monthlyRate = annualRate / 12;
    const path = new Array(years + 1);
    path[0] = 0;

    for (let year = 1; year <= years; year++) {
      const totalMonths = year * 12;
      if (monthlyRate === 0) {
        path[year] = monthlyPayment * totalMonths;
      } else {
        path[year] = monthlyPayment *
          ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
      }
    }
    return path;
  }
}
