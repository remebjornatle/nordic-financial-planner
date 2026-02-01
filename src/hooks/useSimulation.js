import { useState, useMemo } from 'react';
import { MonteCarloEngine } from '../simulation/monteCarloEngine';
import { HistogramBinner } from '../simulation/histogramBinner';
import { computeTimeSeriesBands } from '../utils/timeSeriesStats';
import nordicReturns from '../data/nordicStockReturns.json';

/**
 * Custom hook for managing simulation state and running Monte Carlo simulations
 * Handles all input parameters and memoizes expensive simulation calculations
 *
 * @returns {Object} - Simulation state and setter functions
 */
export const useSimulation = () => {
  // Input parameters
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [timeHorizon, setTimeHorizon] = useState(10);
  const [mortgageRate, setMortgageRate] = useState(4.5);
  const [stockAllocation, setStockAllocation] = useState(50);

  // Initialize Monte Carlo engine once (singleton pattern)
  const engine = useMemo(() => new MonteCarloEngine(nordicReturns), []);

  // Run simulation and calculate results (memoized based on inputs)
  const results = useMemo(() => {
    console.time('Simulation');

    // Run Monte Carlo simulation with time series (10,000 iterations)
    const rawResults = engine.runSimulationWithTimeSeries({
      monthlyInvestment,
      timeHorizon,
      mortgageRate: mortgageRate / 100,  // Convert percentage to decimal
      stockAllocation
    });

    // Calculate statistics and percentiles for stock scenario
    const stockStats = HistogramBinner.calculateStatistics(rawResults.stock);
    const stockPercentiles = HistogramBinner.calculatePercentiles(rawResults.stock);

    // Calculate statistics and percentiles for mortgage scenario
    const mortgageStats = HistogramBinner.calculateStatistics(rawResults.mortgage);
    const mortgagePercentiles = HistogramBinner.calculatePercentiles(rawResults.mortgage);

    // Calculate probability of stocks outperforming mortgage
    const probabilityStockWins = HistogramBinner.calculateOutperformanceProbability(
      rawResults.stock,
      rawResults.mortgage
    );

    // Compute time series bands for fan chart
    const stockBands = computeTimeSeriesBands(
      rawResults.timeSeries.stockPaths,
      timeHorizon
    );
    const mortgagePath = rawResults.timeSeries.mortgagePath;

    const timeSeriesData = stockBands.map((band, i) => ({
      ...band,
      mortgage: mortgagePath[i]
    }));

    console.timeEnd('Simulation');

    return {
      stock: {
        data: rawResults.stock,
        stats: stockStats,
        percentiles: stockPercentiles
      },
      mortgage: {
        data: rawResults.mortgage,
        stats: mortgageStats,
        percentiles: mortgagePercentiles
      },
      comparison: {
        probabilityStockWins,
        probabilityMortgageWins: 1 - probabilityStockWins
      },
      timeSeriesData
    };
  }, [monthlyInvestment, timeHorizon, mortgageRate, stockAllocation, engine]);

  // Return all state and setters
  return {
    // Input state
    monthlyInvestment,
    timeHorizon,
    mortgageRate,
    stockAllocation,

    // Simulation results
    results,

    // Setter functions
    setMonthlyInvestment,
    setTimeHorizon,
    setMortgageRate,
    setStockAllocation
  };
};
