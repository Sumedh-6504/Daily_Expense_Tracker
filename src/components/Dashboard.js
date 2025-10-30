import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ExpenseProvider } from "../context/ExpenseContext";
import { BudgetProvider } from "../context/BudgetContext";
import AddExpense from "./AddExpense";
import ExpenseList from "./ExpenseList";
import BudgetTracker from "./BudgetTracker";
import Analytics from "./Analytics";
import Reports from "./Reports";
import "./Dashboard.css";

const DashboardContent = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("expenses");

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleExpenseAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleExpenseUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>� Daily Expense Tracker</h1>
          <p className="user-greeting">Hello, {user?.username}!</p>
        </div>
        <button onClick={handleSignOut} className="btn-logout">
          Sign Out
        </button>
      </header>

      <main className="dashboard-main">
        {/* User Info Card (At Top) */}
        <div className="dashboard-card user-info-card">
          <h2>Account Information</h2>
          <div className="user-info">
            <p>
              <strong>Username:</strong> {user?.username}
            </p>
            <p>
              <strong>Email:</strong> {user?.attributes?.email}
            </p>
            <p>
              <strong>Email Verified:</strong>{" "}
              {user?.attributes?.email_verified ? "✓ Yes" : "✗ No"}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "expenses" ? "active" : ""}`}
            onClick={() => setActiveTab("expenses")}
          >
            📝 Expenses
          </button>
          <button
            className={`tab-button ${activeTab === "budget" ? "active" : ""}`}
            onClick={() => setActiveTab("budget")}
          >
            💼 Budget
          </button>
          <button
            className={`tab-button ${
              activeTab === "analytics" ? "active" : ""
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            📊 Analytics
          </button>
          <button
            className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            📄 Reports
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "expenses" && (
            <section key={refreshKey} className="expense-section">
              <AddExpense onExpenseAdded={handleExpenseAdded} />
              <ExpenseList onExpenseUpdated={handleExpenseUpdated} />
            </section>
          )}

          {activeTab === "budget" && (
            <section className="budget-section">
              <BudgetTracker />
            </section>
          )}

          {activeTab === "analytics" && (
            <section className="analytics-section">
              <Analytics />
            </section>
          )}

          {activeTab === "reports" && (
            <section className="reports-section">
              <Reports />
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <ExpenseProvider>
      <BudgetProvider>
        <DashboardContent />
      </BudgetProvider>
    </ExpenseProvider>
  );
};

export default Dashboard;
