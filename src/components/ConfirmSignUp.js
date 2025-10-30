import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const ConfirmSignUp = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { confirmSignUp, resendConfirmationCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await confirmSignUp(email, code);
      setSuccessMessage(
        "Email confirmed successfully! Redirecting to sign in..."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Failed to confirm sign-up. Please check the code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      await resendConfirmationCode(email);
      setSuccessMessage("Confirmation code resent to your email!");
    } catch (error) {
      setErrorMessage(error.message || "Failed to resend confirmation code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Confirm Email</h1>
        <p>Enter the confirmation code sent to {email}</p>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Confirmation Code:</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={isLoading}
              placeholder="6-digit code"
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Confirming..." : "Confirm"}
          </button>
        </form>
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isLoading}
          className="btn-secondary"
        >
          Resend Code
        </button>
      </div>
    </div>
  );
};

export default ConfirmSignUp;
