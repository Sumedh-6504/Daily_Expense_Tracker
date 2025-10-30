import React from "react";
import { useBudget } from "../context/BudgetContext";
import "./Analytics.css";

const Analytics = () => {
  const {
    getTotalSpending,
    getCurrentMonthSpending,
    getTopCategories,
    getMonthlyTotals,
    budgetLimit,
  } = useBudget();

  const topCategories = getTopCategories(5);
  const monthlyTotals = getMonthlyTotals();

  const maxMonthlySpending =
    monthlyTotals.length > 0
      ? Math.max(...monthlyTotals.map((m) => m.total))
      : 1;

  const totalSpent = getTotalSpending();
  const currentMonthSpent = getCurrentMonthSpending();

  return (
    <div className="analytics-container">
      <h2>Analytics & Insights</h2>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-label">Total Spending</div>
          <div className="summary-value">₹{totalSpent.toFixed(2)}</div>
          <div className="summary-meta">All time</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">This Month</div>
          <div className="summary-value">₹{currentMonthSpent.toFixed(2)}</div>
          <div className="summary-meta">
            {budgetLimit > 0
              ? `${Math.round(
                  (currentMonthSpent / budgetLimit) * 100
                )}% of budget`
              : ""}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Avg. Per Transaction</div>
          <div className="summary-value">
            ₹
            {totalSpent > 0
              ? (totalSpent / 1).toFixed(2) // Will be calculated from expenses count
              : "0.00"}
          </div>
          <div className="summary-meta">Average</div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="analytics-section">
        <h3>Top Spending Categories</h3>
        {topCategories.length > 0 ? (
          <div className="categories-list">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="category-item">
                <div className="category-header">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-amount">
                    ₹{cat.total.toFixed(2)}
                  </span>
                </div>
                <div className="category-bar">
                  <div
                    className="category-progress"
                    style={{ width: `${(cat.total / totalSpent) * 100}%` }}
                  />
                </div>
                <div className="category-meta">
                  <span>{cat.count} transactions</span>
                  <span>₹{cat.average.toFixed(2)} avg</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No spending data available</p>
        )}
      </div>

      {/* Monthly Trend */}
      <div className="analytics-section">
        <h3>Monthly Spending Trend</h3>
        {monthlyTotals.length > 0 ? (
          <div className="monthly-chart">
            {monthlyTotals.map((month, idx) => (
              <div key={idx} className="month-bar-container">
                <div className="month-bar">
                  <div
                    className="month-bar-fill"
                    style={{
                      height: `${(month.total / maxMonthlySpending) * 200}px`,
                    }}
                  />
                </div>
                <div className="month-label">{month.month}</div>
                <div className="month-amount">₹{month.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No monthly data available</p>
        )}
      </div>

      {/* Quick Insights */}
      <div className="analytics-section insights">
        <h3>Quick Insights</h3>
        <div className="insights-list">
          {topCategories.length > 0 && (
            <div className="insight-item">
              <span className="insight-icon">🏆</span>
              <span className="insight-text">
                <strong>{topCategories[0].category}</strong> is your top
                spending category
              </span>
            </div>
          )}
          {monthlyTotals.length > 1 && (
            <div className="insight-item">
              <span className="insight-icon">📈</span>
              <span className="insight-text">
                Compare your spending across months to identify patterns
              </span>
            </div>
          )}
          {budgetLimit > 0 && (
            <div className="insight-item">
              <span className="insight-icon">💡</span>
              <span className="insight-text">
                Set and monitor your monthly budget to stay on track
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
