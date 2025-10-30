import React, { useState } from "react";
import { useTransaction } from "../context/TransactionContext";
import "./Transaction.css";

const TransactionList = () => {
  const { transactions, loading, error, removeTransaction, stats } =
    useTransaction();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [sortBy, setSortBy] = useState("date"); // date, amount, category
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = [
    "All",
    "Food",
    "Transport",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Health",
    "Education",
    "Other",
  ];

  const filteredTransactions = transactions.filter((t) =>
    filterCategory === "All" ? true : t.category === filterCategory
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date) - new Date(a.date);
      case "amount":
        return b.amount - a.amount;
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const handleDelete = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await removeTransaction(transactionId);
      } catch (err) {
        console.error("Error deleting transaction:", err);
      }
    }
  };

  const handleEditStart = (transaction) => {
    setEditingId(transaction.transactionId);
    setEditData({ ...transaction });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  if (loading && transactions.length === 0) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="transaction-list-container">
      <h2>Transactions</h2>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="stats-summary">
          <div className="stat-card">
            <h4>Total Transactions</h4>
            <p className="stat-value">{stats.totalTransactions}</p>
          </div>
          <div className="stat-card">
            <h4>Total Amount</h4>
            <p className="stat-value">₹{stats.totalAmount.toFixed(2)}</p>
          </div>
          {Object.entries(stats.byCategory).length > 0 && (
            <div className="stat-card">
              <h4>Top Category</h4>
              <p className="stat-value">
                {
                  Object.entries(stats.byCategory).sort(
                    (a, b) => b[1].total - a[1].total
                  )[0]?.[0]
                }
              </p>
            </div>
          )}
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filter-category">Category:</label>
          <select
            id="filter-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date (Newest)</option>
            <option value="amount">Amount (Highest)</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {sortedTransactions.length === 0 ? (
        <div className="no-transactions">
          <p>No transactions found. Add one to get started!</p>
        </div>
      ) : (
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction) => (
                <tr key={transaction.transactionId} className="transaction-row">
                  <td>{transaction.date}</td>
                  <td>
                    <span
                      className={`category-badge ${transaction.category.toLowerCase()}`}
                    >
                      {transaction.category}
                    </span>
                  </td>
                  <td className="amount">₹{transaction.amount.toFixed(2)}</td>
                  <td className="note">{transaction.note || "-"}</td>
                  <td className="actions">
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(transaction.transactionId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
