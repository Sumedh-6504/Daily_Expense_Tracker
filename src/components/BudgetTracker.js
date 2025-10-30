import React, { useState } from "react";
import { useBudget } from "../context/BudgetContext";
import "./Budget.css";

const BudgetTracker = () => {
  const {
    budgetLimit,
    setBudgetLimit,
    getTotalSpending,
    getCurrentMonthSpending,
    getRemainingBudget,
    getCurrentMonthRemaining,
    getBudgetPercentage,
    getCurrentMonthPercentage,
    getBudgetStatus,
    getCurrentMonthStatus,
    getBudgetAlerts,
    getCategoryAlerts,
  } = useBudget();

  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budgetLimit);

  const handleSaveBudget = () => {
    if (newBudget > 0) {
      setBudgetLimit(newBudget);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNewBudget(budgetLimit);
    setIsEditing(false);
  };

  const alerts = getBudgetAlerts();
  const categoryAlerts = getCategoryAlerts();
  const allAlerts = [...alerts, ...categoryAlerts];

  const getStatusColor = (status) => {
    switch (status) {
      case "EXCEEDED":
        return "status-danger";
      case "WARNING":
        return "status-warning";
      default:
        return "status-ok";
    }
  };

  const totalSpent = getTotalSpending();
  const currentMonthSpent = getCurrentMonthSpending();

  return (
    <div className="budget-tracker-container">
      <h2>Budget Tracker</h2>

      {/* Alert Messages */}
      {allAlerts.length > 0 && (
        <div className="alerts-section">
          {allAlerts.map((alert, idx) => (
            <div key={idx} className={`alert alert-${alert.type}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Budget Setting */}
      <div className="budget-setting-card">
        <h3>Monthly Budget</h3>
        {isEditing ? (
          <div className="budget-edit-form">
            <div className="input-group">
              <label>Budget Limit (₹)</label>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
                min="0"
                step="50"
              />
            </div>
            <div className="button-group">
              <button onClick={handleSaveBudget} className="btn-save">
                Save
              </button>
              <button onClick={handleCancel} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="budget-display">
            <div className="budget-amount">₹{budgetLimit.toFixed(2)}</div>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-edit-budget"
            >
              Edit Budget
            </button>
          </div>
        )}
      </div>

      {/* Overall Spending */}
      <div className={`budget-card ${getStatusColor(getBudgetStatus())}`}>
        <h3>Total Spending</h3>
        <div className="budget-content">
          <div className="spending-info">
            <div className="spent-amount">₹{totalSpent.toFixed(2)}</div>
            <div className="spent-label">of ₹{budgetLimit.toFixed(2)}</div>
          </div>
          <div className="budget-bar">
            <div
              className="budget-progress"
              style={{ width: `${getBudgetPercentage()}%` }}
            />
          </div>
          <div className="spending-details">
            <span>{getBudgetPercentage()}% Used</span>
            <span>₹{getRemainingBudget().toFixed(2)} Remaining</span>
          </div>
        </div>
      </div>

      {/* Current Month Spending */}
      <div className={`budget-card ${getStatusColor(getCurrentMonthStatus())}`}>
        <h3>Current Month Spending</h3>
        <div className="budget-content">
          <div className="spending-info">
            <div className="spent-amount">₹{currentMonthSpent.toFixed(2)}</div>
            <div className="spent-label">of ₹{budgetLimit.toFixed(2)}</div>
          </div>
          <div className="budget-bar">
            <div
              className="budget-progress"
              style={{ width: `${getCurrentMonthPercentage()}%` }}
            />
          </div>
          <div className="spending-details">
            <span>{getCurrentMonthPercentage()}% Used</span>
            <span>₹{getCurrentMonthRemaining().toFixed(2)} Remaining</span>
          </div>
        </div>
      </div>

      {/* Status Icons */}
      <div className="budget-status-section">
        <div className="status-item">
          <div className="status-icon ok">✓</div>
          <div>
            <div className="status-title">Overall Budget</div>
            <div className="status-text">
              {getBudgetStatus() === "OK" ? "On Track" : "Review Needed"}
            </div>
          </div>
        </div>
        <div className="status-item">
          <div className="status-icon month">📅</div>
          <div>
            <div className="status-title">This Month</div>
            <div className="status-text">
              {getCurrentMonthStatus() === "OK" ? "On Track" : "Review Needed"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
