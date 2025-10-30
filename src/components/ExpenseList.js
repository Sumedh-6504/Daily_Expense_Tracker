import React, { useState } from "react";
import { useExpense } from "../context/ExpenseContext";
import "./Expense.css";

const ExpenseList = ({ onExpenseUpdated }) => {
  const { expenses, updateExpense, deleteExpense, error } = useExpense();
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const categories = [
    "All",
    "Food",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Health",
    "Education",
    "Other",
  ];

  const filteredExpenses = expenses.filter(
    (exp) => filterCategory === "All" || exp.category === filterCategory
  );

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.date) - new Date(a.date);
      case "date-asc":
        return new Date(a.date) - new Date(b.date);
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditFormData({ ...expense });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveEdit = (id) => {
    if (editFormData.amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    updateExpense(id, editFormData);
    setEditingId(null);
    if (onExpenseUpdated) {
      onExpenseUpdated();
    }
  };

  const handleDeleteConfirm = (id) => {
    deleteExpense(id);
    setDeleteConfirm(null);
    if (onExpenseUpdated) {
      onExpenseUpdated();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  if (expenses.length === 0) {
    return (
      <div className="expense-list-container">
        <h2>Expenses</h2>
        <p className="no-expenses">No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  const totalSpent = sortedExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );
  const avgSpent =
    sortedExpenses.length > 0
      ? (totalSpent / sortedExpenses.length).toFixed(2)
      : 0;

  return (
    <div className="expense-list-container">
      <h2>Expenses</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="expense-controls">
        <div className="filter-section">
          <label htmlFor="filter">Filter by Category:</label>
          <select
            id="filter"
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

        <div className="sort-section">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
          </select>
        </div>
      </div>

      {sortedExpenses.length > 0 && (
        <div className="expense-summary">
          <div className="summary-item">
            <span>Total:</span>
            <strong>₹{totalSpent.toFixed(2)}</strong>
          </div>
          <div className="summary-item">
            <span>Average:</span>
            <strong>₹{avgSpent}</strong>
          </div>
          <div className="summary-item">
            <span>Items:</span>
            <strong>{sortedExpenses.length}</strong>
          </div>
        </div>
      )}

      <div className="expense-list">
        {sortedExpenses.map((expense) => (
          <div key={expense.id} className="expense-item">
            {editingId === expense.id ? (
              <div className="expense-edit-form">
                <input
                  type="text"
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  disabled
                  className="edit-field-disabled"
                />
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditChange}
                  className="edit-field"
                />
                <input
                  type="number"
                  name="amount"
                  value={editFormData.amount}
                  onChange={handleEditChange}
                  step="0.01"
                  min="0"
                  className="edit-field"
                />
                <textarea
                  name="note"
                  value={editFormData.note || ""}
                  onChange={handleEditChange}
                  rows="2"
                  className="edit-field"
                />
                <div className="edit-actions">
                  <button
                    onClick={() => handleSaveEdit(expense.id)}
                    className="btn-save"
                  >
                    Save
                  </button>
                  <button onClick={handleCancel} className="btn-cancel">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="expense-details">
                <div className="expense-left">
                  <span className="category-badge">{expense.category}</span>
                  <div className="expense-info">
                    <p className="expense-date">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                    {expense.note && (
                      <p className="expense-note">{expense.note}</p>
                    )}
                  </div>
                </div>
                <div className="expense-amount">
                  ₹{parseFloat(expense.amount).toFixed(2)}
                </div>
                <div className="expense-actions">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  {deleteConfirm === expense.id ? (
                    <>
                      <button
                        onClick={() => handleDeleteConfirm(expense.id)}
                        className="btn-delete-confirm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(expense.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
