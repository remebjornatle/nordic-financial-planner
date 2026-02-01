import React from 'react';
import { HistogramChart } from './HistogramChart';
import './HistogramPair.css';
import { Statistics } from '../utils/statistics';

/**
 * HistogramPair Component
 * Displays single histogram for stock scenario with mortgage median as reference line
 *
 * @param {Object} stockData - Stock scenario simulation results
 * @param {Object} stockPercentiles - Stock percentiles {p5, p50, p95}
 * @param {Object} mortgageData - Mortgage scenario simulation results
 * @param {Object} mortgagePercentiles - Mortgage percentiles {p5, p50, p95}
 * @param {number} stockAllocation - Current stock allocation percentage (0-100)
 * @param {number} monthlyInvestment - Monthly investment amount
 * @param {number} timeHorizon - Time horizon in years
 */
export const HistogramPair = ({
  stockData,
  stockPercentiles,
  mortgageData,
  mortgagePercentiles,
  stockAllocation,
  monthlyInvestment,
  timeHorizon
}) => {
  // Calculate median for mortgage scenario
  const mortgageMedian = mortgagePercentiles.p50;

  return (
    <div className="histogram-pair-container">
      <div className="histogram-single">
        <div className="histogram-card">
          <HistogramChart
            data={stockData}
            title={stockAllocation === 0 ? '100% Nedbetaling av boliglån' : `${stockAllocation}% Aksjer, ${100 - stockAllocation}% Nedbetaling`}
            percentiles={stockPercentiles}
            mortgageMedian={mortgageMedian}
            stockAllocation={stockAllocation}
            monthlyInvestment={monthlyInvestment}
            timeHorizon={timeHorizon}
            color="#4A90E2"
          />
        </div>
      </div>
    </div>
  );
};
