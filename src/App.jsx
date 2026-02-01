import React from 'react';
import { useSimulation } from './hooks/useSimulation';
import { InputPanel } from './components/InputPanel';
import { ComparisonCard } from './components/ComparisonCard';
import { HistogramPair } from './components/HistogramPair';
import { TimeChart } from './components/TimeChart';
import './App.css';

/**
 * Main Application Component
 * Nordic Stock vs Mortgage Paydown Decision Tool
 */
function App() {
  const {
    monthlyInvestment,
    timeHorizon,
    mortgageRate,
    stockAllocation,
    results,
    setMonthlyInvestment,
    setTimeHorizon,
    setMortgageRate,
    setStockAllocation
  } = useSimulation();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          Nordiske aksjer vs. Nedbetaling av boliglån
        </h1>
        <p className="app-subtitle">
          Monte Carlo-simulering med 10 000 scenarier basert på MSCI Nordic Countries Index (1990-2024)
        </p>
      </header>

      <main className="app-main">
        <InputPanel
          monthlyInvestment={monthlyInvestment}
          timeHorizon={timeHorizon}
          mortgageRate={mortgageRate}
          stockAllocation={stockAllocation}
          onMonthlyInvestmentChange={setMonthlyInvestment}
          onTimeHorizonChange={setTimeHorizon}
          onMortgageRateChange={setMortgageRate}
          onStockAllocationChange={setStockAllocation}
        />

        <section className="results-section">
          <ComparisonCard
            stockStats={results.stock.stats}
            mortgageStats={results.mortgage.stats}
            comparison={results.comparison}
            stockAllocation={stockAllocation}
          />

          <div className="charts-grid">
            <HistogramPair
              stockData={results.stock.data}
              stockPercentiles={results.stock.percentiles}
              mortgageData={results.mortgage.data}
              mortgagePercentiles={results.mortgage.percentiles}
              stockAllocation={stockAllocation}
              monthlyInvestment={monthlyInvestment}
              timeHorizon={timeHorizon}
            />

            <TimeChart
              timeSeriesData={results.timeSeriesData}
              stockAllocation={stockAllocation}
            />
          </div>
        </section>

        <footer className="app-footer">
          <div className="footer-content">
            <h3>Forutsetninger og metode</h3>
            <ul>
              <li><strong>Aksjeavkastning:</strong> Basert på MSCI Nordic Countries Index historiske data (1990-2024).
                Avkastning er tilfeldig utvalgt (bootstrap) for å generere realistiske scenarier.</li>
              <li><strong>Skatt:</strong> Norsk gevinstskatt på 37,84% anvendes på investeringsgevinst.</li>
              <li><strong>Boliglånsfordel:</strong> Modellert som spart rente, sammensatt til boliglånsrenten.
                Antar at ekstra innbetalinger reduserer hovedstol og sparer fremtidig rente.</li>
              <li><strong>Simulering:</strong> 10 000 Monte Carlo-iterasjoner per scenario.
                Hver iterasjon genererer en unik markedsbane.</li>
            </ul>
            <p className="footer-note">
              Bygget med React + Vite • Data: MSCI Nordic Countries Index •
              <a href="https://claude.com/claude-code" target="_blank" rel="noopener noreferrer">
                {' '}Generert med Claude Code
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
