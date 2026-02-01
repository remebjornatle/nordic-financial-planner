import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Statistics } from '../utils/statistics';
import './TimeChart.css';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="time-chart-tooltip">
        <p className="tooltip-title">År {d.year}</p>
        <p className="tooltip-row p95">95. persentil: {Statistics.formatNOK(d._p95, true)}</p>
        <p className="tooltip-row p75">75. persentil: {Statistics.formatNOK(d._p75, true)}</p>
        <p className="tooltip-row median">Median: {Statistics.formatNOK(d._p50, true)}</p>
        <p className="tooltip-row p25">25. persentil: {Statistics.formatNOK(d._p25, true)}</p>
        <p className="tooltip-row p5">5. persentil: {Statistics.formatNOK(d._p5, true)}</p>
        <p className="tooltip-row mortgage">Boliglån: {Statistics.formatNOK(d.mortgage, true)}</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = () => (
  <div className="time-chart-legend">
    <span className="legend-item">
      <span className="legend-line" style={{ background: '#4A90E2' }} />
      Median (aksjer)
    </span>
    <span className="legend-item">
      <span className="legend-band inner" />
      25.–75. persentil
    </span>
    <span className="legend-item">
      <span className="legend-band outer" />
      5.–95. persentil
    </span>
    <span className="legend-item">
      <span className="legend-line dashed" />
      Boliglån (100%)
    </span>
  </div>
);

export const TimeChart = ({ timeSeriesData, stockAllocation }) => {
  const chartData = useMemo(() => {
    return timeSeriesData.map(d => ({
      year: d.year,
      base: d.p5,
      outerLower: d.p25 - d.p5,
      innerBand: d.p75 - d.p25,
      outerUpper: d.p95 - d.p75,
      median: d.p50,
      mortgage: d.mortgage,
      _p5: d.p5,
      _p25: d.p25,
      _p50: d.p50,
      _p75: d.p75,
      _p95: d.p95,
      _mean: d.mean
    }));
  }, [timeSeriesData]);

  const chartHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 300 : 400;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const formatYAxis = (value) => Statistics.formatNOK(value, true);

  return (
    <div className="time-chart-container">
      <h3 className="time-chart-title">
        Simulert utvikling over tid
      </h3>

      <CustomLegend />

      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart
          data={chartData}
          margin={
            isMobile
              ? { top: 10, right: 5, left: 5, bottom: 5 }
              : { top: 10, right: 30, left: 20, bottom: 5 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

          <XAxis
            dataKey="year"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            label={{
              value: 'År',
              position: 'insideBottom',
              offset: -2,
              style: { fontWeight: 'bold', fontSize: isMobile ? 10 : 12 }
            }}
          />

          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: isMobile ? 9 : 11 }}
            width={isMobile ? 55 : 70}
            label={{
              value: 'Porteføljeverdi (NOK)',
              angle: -90,
              position: 'insideLeft',
              offset: isMobile ? 5 : 10,
              style: { fontWeight: 'bold', fontSize: isMobile ? 9 : 11 }
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Stacked confidence bands */}
          {stockAllocation > 0 && (
            <>
              {/* Invisible base: 0 to p5 */}
              <Area
                type="monotone"
                dataKey="base"
                stackId="bands"
                fill="transparent"
                stroke="none"
              />

              {/* Outer lower band: p5 to p25 */}
              <Area
                type="monotone"
                dataKey="outerLower"
                stackId="bands"
                fill="#4A90E2"
                fillOpacity={0.1}
                stroke="none"
              />

              {/* Inner band: p25 to p75 */}
              <Area
                type="monotone"
                dataKey="innerBand"
                stackId="bands"
                fill="#4A90E2"
                fillOpacity={0.22}
                stroke="none"
              />

              {/* Outer upper band: p75 to p95 */}
              <Area
                type="monotone"
                dataKey="outerUpper"
                stackId="bands"
                fill="#4A90E2"
                fillOpacity={0.1}
                stroke="none"
              />

              {/* Median line (not stacked) */}
              <Area
                type="monotone"
                dataKey="median"
                stroke="#4A90E2"
                strokeWidth={2.5}
                fill="none"
                dot={false}
              />
            </>
          )}

          {/* Mortgage line (not stacked) */}
          <Area
            type="monotone"
            dataKey="mortgage"
            stroke="#50C878"
            strokeWidth={2.5}
            strokeDasharray="8 4"
            fill="none"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
