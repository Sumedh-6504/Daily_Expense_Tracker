import React, { useState } from "react";
import { useExpense } from "../context/ExpenseContext";
import "./Expense.css";

const AddExpense = ({ onExpenseAdded }) => {
  const { addExpense, error } = useExpense();
  const [formData, setFormData] = useState({
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    note: "",
  });
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Health",
    "Education",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError(null);
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setLocalError("Please enter a valid amount greater than 0");
      return false;
    }
    if (!formData.date) {
      setLocalError("Please select a date");
      return false;
    }
    if (!formData.category) {
      setLocalError("Please select a category");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const newExpense = addExpense({
        category: formData.category,
        date: formData.date,
        amount: formData.amount,
        note: formData.note,
      });

      setSuccess(true);
      setFormData({
        category: "Food",
        date: new Date().toISOString().split("T")[0],
        amount: "",
        note: "",
      });

      if (onExpenseAdded) {
        onExpenseAdded(newExpense);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setLocalError(err.message || "Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-expense-container">
      <h2>Add New Expense</h2>

      {(error || localError) && (
        <div className="error-message">{error || localError}</div>
      )}

      {success && (
        <div className="success-message">Expense added successfully!</div>
      )}

      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="note">Note (Optional)</label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Add a note..."
            rows="3"
          />
        </div>

        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
