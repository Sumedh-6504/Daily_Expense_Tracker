import React, { createContext, useContext } from "react";
import { useExpense } from "./ExpenseContext";

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const {
    expenses,
    budgetLimit,
    setBudgetLimit,
    getTotalSpending,
    getSpendingByCategory,
    getMonthlySpending,
  } = useExpense();

  // Get current month key
  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  // Get current month spending
  const getCurrentMonthSpending = () => {
    const monthlySpending = getMonthlySpending();
    return monthlySpending[getCurrentMonthKey()] || 0;
  };

  // Get remaining budget
  const getRemainingBudget = () => {
    return Math.max(0, budgetLimit - getTotalSpending());
  };

  // Get current month remaining
  const getCurrentMonthRemaining = () => {
    return Math.max(0, budgetLimit - getCurrentMonthSpending());
  };

  // Check if budget exceeded
  const isBudgetExceeded = () => {
    return getTotalSpending() > budgetLimit;
  };

  // Check if current month exceeded
  const isCurrentMonthExceeded = () => {
    return getCurrentMonthSpending() > budgetLimit;
  };

  // Get budget percentage used
  const getBudgetPercentage = () => {
    if (budgetLimit === 0) return 0;
    const percentage = (getTotalSpending() / budgetLimit) * 100;
    return Math.min(100, Math.round(percentage));
  };

  // Get current month percentage
  const getCurrentMonthPercentage = () => {
    if (budgetLimit === 0) return 0;
    const percentage = (getCurrentMonthSpending() / budgetLimit) * 100;
    return Math.min(100, Math.round(percentage));
  };

  // Get budget status (OK, WARNING, EXCEEDED)
  const getBudgetStatus = () => {
    const percentage = getBudgetPercentage();
    if (percentage >= 100) return "EXCEEDED";
    if (percentage >= 80) return "WARNING";
    return "OK";
  };

  // Get current month status
  const getCurrentMonthStatus = () => {
    const percentage = getCurrentMonthPercentage();
    if (percentage >= 100) return "EXCEEDED";
    if (percentage >= 80) return "WARNING";
    return "OK";
  };

  // Get top spending categories
  const getTopCategories = (limit = 5) => {
    const byCategory = getSpendingByCategory();
    return Object.entries(byCategory)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  };

  // Get monthly totals for chart
  const getMonthlyTotals = () => {
    const monthlySpending = getMonthlySpending();
    return Object.entries(monthlySpending)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([month, total]) => ({
        month,
        total,
        percentage:
          budgetLimit > 0 ? Math.round((total / budgetLimit) * 100) : 0,
      }));
  };

  // Get budget alerts
  const getBudgetAlerts = () => {
    const alerts = [];

    if (isCurrentMonthExceeded()) {
      alerts.push({
        type: "danger",
        message: `Current month budget exceeded! You've spent $${getCurrentMonthSpending().toFixed(
          2
        )} of $${budgetLimit.toFixed(2)}`,
      });
    } else if (getCurrentMonthPercentage() >= 80) {
      alerts.push({
        type: "warning",
        message: `Current month spending is ${getCurrentMonthPercentage()}% of budget. $${getCurrentMonthRemaining().toFixed(
          2
        )} remaining.`,
      });
    }

    if (getTotalSpending() > budgetLimit) {
      alerts.push({
        type: "danger",
        message: `Total spending exceeded budget! Over by $${(
          getTotalSpending() - budgetLimit
        ).toFixed(2)}`,
      });
    }

    return alerts;
  };

  // Get category alerts
  const getCategoryAlerts = () => {
    const topCategories = getTopCategories(3);
    const avgSpending =
      getTotalSpending() > 0 ? getTotalSpending() / expenses.length : 0;

    return topCategories
      .filter((cat) => cat.average > avgSpending * 1.5)
      .map((cat) => ({
        type: "info",
        message: `${cat.category} spending average ($${cat.average.toFixed(
          2
        )}) is above overall average`,
      }));
  };

  const value = {
    budgetLimit,
    setBudgetLimit,
    getTotalSpending,
    getSpendingByCategory,
    getCurrentMonthSpending,
    getRemainingBudget,
    getCurrentMonthRemaining,
    isBudgetExceeded,
    isCurrentMonthExceeded,
    getBudgetPercentage,
    getCurrentMonthPercentage,
    getBudgetStatus,
    getCurrentMonthStatus,
    getTopCategories,
    getMonthlyTotals,
    getBudgetAlerts,
    getCategoryAlerts,
    getCurrentMonthKey,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
};
