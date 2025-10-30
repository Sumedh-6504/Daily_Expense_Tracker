import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { forgotPasswordSubmit } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from navigation state if available
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const validateForm = () => {
    if (!email) {
      setErrorMessage("Please enter your email address");
      return false;
    }
    if (!code) {
      setErrorMessage("Please enter the verification code");
      return false;
    }
    if (!newPassword) {
      setErrorMessage("Please enter a new password");
      return false;
    }
    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return false;
    }
    // Check password policy
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*]/.test(newPassword);

    if (!hasUpperCase) {
      setErrorMessage("Password must contain uppercase letters");
      return false;
    }
    if (!hasLowerCase) {
      setErrorMessage("Password must contain lowercase letters");
      return false;
    }
    if (!hasNumbers) {
      setErrorMessage("Password must contain numbers");
      return false;
    }
    if (!hasSpecialChar) {
      setErrorMessage("Password must contain special characters (!@#$%^&*)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await forgotPasswordSubmit(email, code, newPassword);
      setSuccessMessage("Password reset successfully! Redirecting to login...");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Failed to reset password. Please check your code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p className="auth-description">
          Enter the code from your email and your new password.
        </p>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Verification Code:</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter the code from your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password:</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter new password"
            />
            <small className="password-hint">
              Must contain uppercase, lowercase, numbers, and special characters
              (!@#$%^&*)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to Sign In</Link>
          <Link to="/forgot-password">Didn't receive the code?</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
