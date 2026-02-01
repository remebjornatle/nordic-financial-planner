import React from 'react';
import { Statistics } from '../utils/statistics';
import './ComparisonCard.css';

export const ComparisonCard = ({
  stockStats,
  mortgageStats,
  comparison,
  stockAllocation
}) => {
  const probabilityStockWins = comparison.probabilityStockWins;
  const stockWinsPct = Statistics.formatPercent(probabilityStockWins, 1);

  const rows = [
    { label: '5. persentil', sublabel: 'Pessimistisk', key: 'p5' },
    { label: '25. persentil', sublabel: '', key: 'p25' },
    { label: '50. persentil', sublabel: 'Median', key: 'p50', highlight: true },
    { label: '75. persentil', sublabel: '', key: 'p75' },
    { label: '95. persentil', sublabel: 'Optimistisk', key: 'p95' },
    { label: 'Gjennomsnitt', sublabel: 'Forventet verdi', key: 'mean', highlight: false },
  ];

  return (
    <div className="comparison-card">
      <div className="comparison-header">
        <div className="probability-badge">
          <span className="probability-value">{stockWinsPct}</span>
          <span className="probability-label">
            sjanse for at aksjer slår ren boliglånsnedbetaling
          </span>
        </div>
      </div>

      <div className="comparison-grid">
        <div className="grid-header">
          <div className="grid-cell label-cell"></div>
          <div className="grid-cell stock-header">
            {stockAllocation}% Aksjer
          </div>
          <div className="grid-cell mortgage-header">
            100% Boliglån
          </div>
          <div className="grid-cell diff-header">
            Forskjell
          </div>
        </div>

        {rows.map(row => {
          const stockVal = stockStats[row.key];
          const mortgageVal = mortgageStats[row.key];
          const diff = stockVal - mortgageVal;

          return (
            <div
              className={`grid-row ${row.highlight ? 'grid-row-highlight' : ''}`}
              key={row.key}
            >
              <div className="grid-cell label-cell">
                <span className="row-label">{row.label}</span>
                {row.sublabel && (
                  <span className="row-sublabel">{row.sublabel}</span>
                )}
              </div>
              <div className="grid-cell stock-cell">
                {Statistics.formatNOK(stockVal, true)}
              </div>
              <div className="grid-cell mortgage-cell">
                {Statistics.formatNOK(mortgageVal, true)}
              </div>
              <div
                className="grid-cell diff-cell"
                style={{ color: diff >= 0 ? '#28a745' : '#dc3545' }}
              >
                {diff >= 0 ? '+' : ''}{Statistics.formatNOK(diff, true)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="comparison-disclaimer">
        <strong>Viktig:</strong> Dette er et beslutningsverktøy basert på historiske data, ikke finansiell rådgivning.
        Tidligere resultater garanterer ikke fremtidige resultater.
      </div>
    </div>
  );
};
