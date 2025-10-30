import React, { useState } from "react";
import { useExpense } from "../context/ExpenseContext";
import { useBudget } from "../context/BudgetContext";
import "./Reports.css";

const Reports = () => {
  const { expenses, getSpendingByCategory } = useExpense();
  const { getCurrentMonthKey, getCurrentMonthSpending } = useBudget();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const categorySpending = getSpendingByCategory();

  // Get unique months from expenses
  const getAvailableMonths = () => {
    const months = new Set();
    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      months.add(month);
    });
    return Array.from(months).sort().reverse();
  };

  const getExpensesByMonth = (month) => {
    return expenses.filter((exp) => {
      const date = new Date(exp.date);
      const expMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      return expMonth === month;
    });
  };

  const selectedMonthExpenses = getExpensesByMonth(selectedMonth);
  const monthlyTotal = selectedMonthExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );

  const availableMonths = getAvailableMonths();
  // eslint-disable-next-line no-unused-vars
  const currentMonthSpent = getCurrentMonthSpending();

  return (
    <div className="reports-container">
      <h2>Monthly Reports</h2>

      {/* Month Selector */}
      <div className="month-selector">
        <label htmlFor="month-select">Select Month:</label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {availableMonths.length === 0 ? (
            <option>No data</option>
          ) : (
            availableMonths.map((month) => (
              <option key={month} value={month}>
                {new Date(`${month}-01`).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </option>
            ))
          )}
        </select>
      </div>

      {selectedMonthExpenses.length > 0 ? (
        <>
          {/* Month Summary */}
          <div className="month-summary">
            <div className="summary-stat">
              <div className="stat-label">Total Spending</div>
              <div className="stat-value">₹{monthlyTotal.toFixed(2)}</div>
            </div>
            <div className="summary-stat">
              <div className="stat-label">Transactions</div>
              <div className="stat-value">{selectedMonthExpenses.length}</div>
            </div>
            <div className="summary-stat">
              <div className="stat-label">Average</div>
              <div className="stat-value">
                ₹{(monthlyTotal / selectedMonthExpenses.length).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="report-section">
            <h3>Category Breakdown</h3>
            <div className="category-breakdown">
              {Object.entries(categorySpending).map(([category, data]) => {
                const categoryTotal = data.total;
                const percentage =
                  monthlyTotal > 0 ? (categoryTotal / monthlyTotal) * 100 : 0;
                return (
                  <div key={category} className="breakdown-item">
                    <div className="breakdown-header">
                      <span className="breakdown-category">{category}</span>
                      <span className="breakdown-amount">
                        ₹{categoryTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="breakdown-bar">
                      <div
                        className="breakdown-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="breakdown-footer">
                      <span>{percentage.toFixed(1)}% of total</span>
                      <span>{data.count} items</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions List */}
          <div className="report-section">
            <h3>Transactions</h3>
            <div className="transactions-list">
              {selectedMonthExpenses
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((expense) => (
                  <div key={expense.id} className="transaction-row">
                    <div className="transaction-left">
                      <div className="transaction-category">
                        {expense.category}
                      </div>
                      <div className="transaction-date">
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                      {expense.note && (
                        <div className="transaction-note">{expense.note}</div>
                      )}
                    </div>
                    <div className="transaction-amount">
                      ₹{parseFloat(expense.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Export Button */}
          <div className="report-actions">
            <button
              onClick={() => {
                const csv = generateCSV(selectedMonthExpenses);
                downloadCSV(csv, `expenses-${selectedMonth}.csv`);
              }}
              className="btn-export"
            >
              📥 Export as CSV
            </button>
            <button
              onClick={() => {
                const json = JSON.stringify(selectedMonthExpenses, null, 2);
                downloadJSON(json, `expenses-${selectedMonth}.json`);
              }}
              className="btn-export"
            >
              📥 Export as JSON
            </button>
          </div>
        </>
      ) : (
        <div className="no-data-message">
          <p>No expenses recorded for this month</p>
        </div>
      )}
    </div>
  );
};

// Helper functions for export
const generateCSV = (expenses) => {
  const headers = ["Date", "Category", "Amount", "Note"];
  const rows = expenses.map((exp) => [
    exp.date,
    exp.category,
    parseFloat(exp.amount).toFixed(2),
    exp.note || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
};

const downloadCSV = (csv, filename) => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const downloadJSON = (json, filename) => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/json;charset=utf-8,${encodeURIComponent(json)}`
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export default Reports;
