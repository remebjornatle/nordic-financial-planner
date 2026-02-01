import React, { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import './InputPanel.css';

/**
 * InputPanel Component
 * Contains all user input controls for the simulation
 *
 * @param {Object} props - Component props
 */
export const InputPanel = ({
  monthlyInvestment,
  timeHorizon,
  mortgageRate,
  stockAllocation,
  onMonthlyInvestmentChange,
  onTimeHorizonChange,
  onMortgageRateChange,
  onStockAllocationChange
}) => {
  // Local state for slider to ensure smooth UI
  const [sliderValue, setSliderValue] = useState(stockAllocation);

  // Debounce slider updates to prevent excessive simulations
  const debouncedSliderValue = useDebounce(sliderValue, 150);

  // Update parent when debounced value changes
  React.useEffect(() => {
    onStockAllocationChange(debouncedSliderValue);
  }, [debouncedSliderValue, onStockAllocationChange]);

  // Handle slider change (update local state immediately for smooth UI)
  const handleSliderChange = (e) => {
    setSliderValue(Number(e.target.value));
  };

  return (
    <div className="input-panel">
      <h2 className="input-panel-title">Simuleringsparametere</h2>

      <div className="input-grid">
        {/* Monthly Investment */}
        <div className="input-group">
          <label htmlFor="monthly-investment">
            Månedlig disponibel inntekt (NOK)
          </label>
          <input
            id="monthly-investment"
            type="number"
            min="1000"
            max="100000"
            step="1000"
            value={monthlyInvestment}
            onChange={(e) => onMonthlyInvestmentChange(Number(e.target.value))}
            className="input-field"
          />
          <span className="input-hint">Beløp tilgjengelig månedlig for investering eller nedbetaling</span>
        </div>

        {/* Time Horizon */}
        <div className="input-group">
          <label htmlFor="time-horizon">
            Tidshorisont
          </label>
          <select
            id="time-horizon"
            value={timeHorizon}
            onChange={(e) => onTimeHorizonChange(Number(e.target.value))}
            className="input-field select-field"
          >
            <option value={5}>5 år</option>
            <option value={10}>10 år</option>
            <option value={15}>15 år</option>
            <option value={20}>20 år</option>
          </select>
          <span className="input-hint">Investerings-/nedbetalingsperiode</span>
        </div>

        {/* Mortgage Interest Rate */}
        <div className="input-group">
          <label htmlFor="mortgage-rate">
            Boliglånsrente (%)
          </label>
          <input
            id="mortgage-rate"
            type="number"
            min="0"
            max="15"
            step="0.1"
            value={mortgageRate}
            onChange={(e) => onMortgageRateChange(Number(e.target.value))}
            className="input-field"
          />
          <span className="input-hint">Forventet boliglånsrente</span>
        </div>
      </div>

      {/* Stock Allocation Slider */}
      <div className="slider-group">
        <label htmlFor="stock-allocation">
          Andel til aksjer: <strong>{sliderValue}%</strong>
        </label>

        <div className="slider-container">
          <span className="slider-label-left">0% Aksjer<br/>(100% Nedbetaling)</span>

          <input
            id="stock-allocation"
            type="range"
            min="0"
            max="100"
            step="5"
            value={sliderValue}
            onChange={handleSliderChange}
            className="allocation-slider"
            style={{
              background: `linear-gradient(to right, #50C878 0%, #50C878 ${100 - sliderValue}%, #4A90E2 ${100 - sliderValue}%, #4A90E2 100%)`
            }}
          />

          <span className="slider-label-right">100% Aksjer<br/>(0% Nedbetaling)</span>
        </div>
      </div>
    </div>
  );
};
