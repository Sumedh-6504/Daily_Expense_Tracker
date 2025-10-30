import React, { createContext, useState, useEffect, useContext } from "react";
import {
  signUp as amplifySignUp,
  signIn as amplifySignIn,
  confirmSignUp as amplifyConfirmSignUp,
  signOut as amplifySignOut,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already signed in when the app loads
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.log("No user currently signed in");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, attributes = {}) => {
    try {
      setError(null);
      const result = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            ...attributes,
          },
        },
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const confirmSignUp = async (email, code) => {
    try {
      setError(null);
      await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const user = await amplifySignIn({
        username: email,
        password,
      });
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await amplifySignOut();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resendConfirmationCode = async (email) => {
    try {
      setError(null);
      await resendSignUpCode({
        username: email,
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      await resetPassword({
        username: email,
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const forgotPasswordSubmit = async (email, code, newPassword) => {
    try {
      setError(null);
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    resendConfirmationCode,
    forgotPassword,
    forgotPasswordSubmit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
