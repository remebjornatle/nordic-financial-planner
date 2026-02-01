import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { HistogramBinner } from '../simulation/histogramBinner';
import { Statistics } from '../utils/statistics';

/**
 * HistogramChart Component
 * Displays a histogram of Monte Carlo simulation results with percentile markers
 *
 * @param {Array<number>} data - Raw simulation results (10,000 values)
 * @param {string} title - Chart title
 * @param {Object} percentiles - Percentile values {p5, p50, p95}
 * @param {number} mortgageMedian - Median mortgage scenario value (shown as red line)
 * @param {number} stockAllocation - Stock allocation percentage (0-100)
 * @param {number} monthlyInvestment - Monthly investment amount
 * @param {number} timeHorizon - Time horizon in years
 * @param {string} color - Bar color
 */
export const HistogramChart = ({
  data,
  title,
  percentiles,
  mortgageMedian,
  stockAllocation,
  monthlyInvestment,
  timeHorizon,
  color = '#8884d8'
}) => {
  // Memoize binned data to prevent recalculation on re-renders
  const binnedData = useMemo(() => {
    if (stockAllocation === 0) {
      // Return empty data for chart structure when no stocks
      return [{ binStart: 0, binEnd: 0, count: 0, midpoint: mortgageMedian }];
    }
    return HistogramBinner.binData(data);
  }, [data, stockAllocation, mortgageMedian]);

  // Calculate dynamic domain based on ACTUAL midpoint values
  const { domain, ticks } = useMemo(() => {
    let minValue = 0;
    let maxValue = mortgageMedian || 0;

    if (stockAllocation > 0 && binnedData.length > 0) {
      // Find actual min and max from MIDPOINT values (what's actually plotted)
      const midpoints = binnedData.map(d => d.midpoint);
      const dataMin = Math.min(...midpoints);
      const dataMax = Math.max(...midpoints);

      minValue = Math.min(dataMin, mortgageMedian || dataMin);
      maxValue = Math.max(dataMax, mortgageMedian || dataMax);
    } else if (mortgageMedian) {
      // Only mortgage scenario
      minValue = 0;
      maxValue = mortgageMedian;
    }

    // Add 15% padding on the max side for visual space
    const range = maxValue - minValue;
    const paddedMin = Math.max(0, minValue - (range * 0.05));
    const paddedMax = maxValue + (range * 0.15);

    // Round to nice numbers
    const roundTo = (value) => {
      if (value < 100000) return Math.ceil(value / 10000) * 10000; // Round to 10k
      if (value < 1000000) return Math.ceil(value / 100000) * 100000; // Round to 100k
      return Math.ceil(value / 500000) * 500000; // Round to 500k
    };

    const minRounded = Math.floor(paddedMin / 10000) * 10000;
    const maxRounded = roundTo(paddedMax);

    // Generate appropriate ticks based on range
    const generateTicks = (min, max) => {
      const range = max - min;
      let tickInterval;
      if (range <= 500000) tickInterval = 100000; // 100k intervals
      else if (range <= 2000000) tickInterval = 250000; // 250k intervals
      else if (range <= 5000000) tickInterval = 500000; // 500k intervals
      else tickInterval = 1000000; // 1M intervals

      const ticks = [];
      for (let tick = Math.ceil(min / tickInterval) * tickInterval; tick <= max; tick += tickInterval) {
        ticks.push(tick);
        if (ticks.length >= 8) break;
      }
      return ticks.length > 0 ? ticks : [min, max];
    };

    return {
      domain: [minRounded, maxRounded],
      ticks: generateTicks(minRounded, maxRounded)
    };
  }, [data, mortgageMedian, stockAllocation, binnedData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const bin = payload[0].payload;

      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
            {Statistics.formatNOK(bin.binStart, true)} - {Statistics.formatNOK(bin.binEnd, true)}
          </p>
          <p style={{ margin: '0', color: color }}>
            Frekvens: {bin.count} ({Statistics.formatPercent(bin.percentage / 100, 1)})
          </p>
        </div>
      );
    }
    return null;
  };

  // Format X-axis labels
  const formatXAxis = (value) => {
    return Statistics.formatNOK(value, true);
  };

  // Adjust height based on screen size
  const chartHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 300 : 400;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3 style={{
        textAlign: 'center',
        marginBottom: '10px',
        color: '#333',
        fontSize: window.innerWidth < 768 ? '1rem' : '1.17rem'
      }}>
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          data={binnedData}
          margin={
            window.innerWidth < 768
              ? { top: 15, right: 5, left: 5, bottom: 60 }
              : { top: 20, right: 30, left: 20, bottom: 70 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

          <XAxis
            dataKey="midpoint"
            type="number"
            domain={domain}
            tickFormatter={formatXAxis}
            angle={-45}
            textAnchor="end"
            height={window.innerWidth < 768 ? 70 : 80}
            tick={{ fontSize: window.innerWidth < 768 ? 9 : 11 }}
            ticks={ticks}
            label={{
              value: 'Nettoformue (NOK)',
              position: 'insideBottom',
              offset: window.innerWidth < 768 ? -50 : -60,
              style: { fontWeight: 'bold', fontSize: window.innerWidth < 768 ? 10 : 12 }
            }}
          />

          <YAxis
            label={{
              value: stockAllocation > 0 ? 'Frekvens' : '',
              angle: -90,
              position: 'insideLeft',
              style: { fontWeight: 'bold', fontSize: window.innerWidth < 768 ? 10 : 12 }
            }}
            tick={{ fontSize: window.innerWidth < 768 ? 9 : 11 }}
          />

          <Tooltip content={stockAllocation > 0 ? <CustomTooltip /> : null} />

          <Legend
            verticalAlign="top"
            height={window.innerWidth < 768 ? 28 : 36}
            content={() => (
              <div style={{
                textAlign: 'center',
                fontSize: window.innerWidth < 480 ? '0.7rem' : (window.innerWidth < 768 ? '0.75rem' : '0.85rem'),
                color: '#666',
                marginBottom: window.innerWidth < 768 ? '5px' : '10px',
                padding: '0 0.5rem'
              }}>
                {stockAllocation > 0
                  ? (window.innerWidth < 480
                    ? '10 000 simuleringer'
                    : 'Hver søyle representerer utfall fra 10 000 simuleringer')
                  : 'Kun nedbetaling av boliglån'}
              </div>
            )}
          />

          {/* Main histogram bars - only show if stocks > 0 */}
          {stockAllocation > 0 && <Bar dataKey="count" fill={color} />}

          {/* Mortgage reference line (RED) */}
          {mortgageMedian && (
            <ReferenceLine
              x={mortgageMedian}
              stroke="#dc3545"
              strokeWidth={window.innerWidth < 768 ? 2.5 : 3}
              label={{
                value: window.innerWidth < 480 ? 'Boliglån' : 'Boliglån (100%)',
                position: 'top',
                fill: '#dc3545',
                fontSize: window.innerWidth < 480 ? 9 : (window.innerWidth < 768 ? 10 : 12),
                fontWeight: 'bold'
              }}
            />
          )}

          {/* Percentile reference lines - only show if stocks > 0 */}
          {percentiles && stockAllocation > 0 && (
            <>
              <ReferenceLine
                x={percentiles.p5}
                stroke="#999"
                strokeWidth={window.innerWidth < 768 ? 1 : 1.5}
                strokeDasharray="5 5"
                label={{
                  value: '5%',
                  position: 'top',
                  fill: '#666',
                  fontSize: window.innerWidth < 768 ? 8 : 10,
                  fontWeight: 'normal'
                }}
              />

              <ReferenceLine
                x={percentiles.p50}
                stroke="#28a745"
                strokeWidth={window.innerWidth < 768 ? 1.5 : 2}
              />

              <ReferenceLine
                x={percentiles.p95}
                stroke="#999"
                strokeWidth={window.innerWidth < 768 ? 1 : 1.5}
                strokeDasharray="5 5"
                label={{
                  value: '95%',
                  position: 'top',
                  fill: '#666',
                  fontSize: window.innerWidth < 768 ? 8 : 10,
                  fontWeight: 'normal'
                }}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Percentile values display */}
      {stockAllocation > 0 ? (
        percentiles && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: window.innerWidth < 768 ? '0.5rem' : '1rem',
            marginTop: '10px',
            fontSize: window.innerWidth < 480 ? '0.7rem' : (window.innerWidth < 768 ? '0.75rem' : '0.85rem'),
            color: '#666',
            textAlign: 'center'
          }}>
            <span style={{ color: '#999' }}>
              5%: {Statistics.formatNOK(percentiles.p5, true)}
            </span>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              Median: {Statistics.formatNOK(percentiles.p50, true)}
            </span>
            <span style={{ color: '#999' }}>
              95%: {Statistics.formatNOK(percentiles.p95, true)}
            </span>
            {mortgageMedian && (
              <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                Boliglån: {Statistics.formatNOK(mortgageMedian, true)}
              </span>
            )}
          </div>
        )
      ) : (
        mortgageMedian && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
            fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem',
            color: '#dc3545',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            100% Boliglånsnedbetaling: {Statistics.formatNOK(mortgageMedian, true)}
          </div>
        )
      )}
    </div>
  );
};
