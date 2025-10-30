import React, { createContext, useState, useContext, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const ExpenseContext = createContext();

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [budgetLimit, setBudgetLimit] = useState(5000);

  // DynamoDB configuration
  const TABLE_NAME = "expenses"; // DynamoDB table name (keep as-is)
  const DDB_REGION = "ap-south-1"; // region where your DynamoDB table lives

  // Helper: build a DynamoDBDocumentClient using temporary credentials from Amplify Auth
  const getDocClient = useCallback(async () => {
    try {
      // Get AWS credentials from Amplify (Identity Pool must be configured)
      const session = await fetchAuthSession();

      if (!session) {
        console.warn("No session available - user may not be authenticated");
        throw new Error("No Amplify session available");
      }

      const creds = session.credentials;

      if (!creds) {
        console.warn(
          "No credentials in session - ensure Identity Pool is configured with proper IAM roles in AWS"
        );
        console.warn("Setup instructions:");
        console.warn("1. Go to AWS Cognito Console > Identity Pools");
        console.warn("2. Select your pool and click 'Edit identity pool'");
        console.warn("3. Ensure authenticated IAM role is assigned");
        console.warn("4. In IAM Console, add DynamoDB permissions to the role");
        throw new Error(
          "No credentials found. Identity Pool IAM roles may not be properly configured."
        );
      }

      console.log("✓ Credentials retrieved successfully from Identity Pool");

      // Create DynamoDB client with the credentials from Amplify
      const ddbClient = new DynamoDBClient({
        region: DDB_REGION,
        credentials: {
          accessKeyId: creds.accessKeyId,
          secretAccessKey: creds.secretAccessKey,
          sessionToken: creds.sessionToken,
        },
      });

      return DynamoDBDocumentClient.from(ddbClient);
    } catch (err) {
      console.warn("Failed to get AWS credentials from Amplify Auth:", err);
      throw err;
    }
  }, []);

  // Put a new expense into DynamoDB (fire-and-forget)
  const putExpenseToDynamo = useCallback(
    async (expense) => {
      try {
        const user = await getCurrentUser();
        const userId = user?.userId || user?.username;
        if (!userId) {
          console.warn("No authenticated user found - skipping DynamoDB sync");
          return;
        }

        const docClient = await getDocClient();

        const item = {
          userId,
          expenseId: expense.id,
          amount: expense.amount,
          category: expense.category || null,
          date: expense.date || null,
          description: expense.description || null,
          createdAt: expense.createdAt || new Date().toISOString(),
          updatedAt: expense.updatedAt || null,
        };

        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
          })
        );
        console.log("Expense successfully synced to DynamoDB:", expense.id);
      } catch (err) {
        // Don't throw — keep local UX responsive. Log for debugging.
        console.warn("DynamoDB put failed - expense stored locally only:", err);
      }
    },
    [getDocClient]
  );

  // Update an expense in DynamoDB (fire-and-forget)
  const updateExpenseInDynamo = useCallback(
    async (expenseId, updateData) => {
      try {
        const user = await getCurrentUser();
        const userId = user?.userId || user?.username;
        if (!userId) {
          console.warn("No authenticated user found - skipping DynamoDB sync");
          return;
        }

        const docClient = await getDocClient();

        // Build UpdateExpression dynamically
        const setParts = [];
        const ExpressionAttributeNames = {};
        const ExpressionAttributeValues = {};
        let idx = 0;
        Object.keys(updateData).forEach((key) => {
          // ignore undefined
          if (typeof updateData[key] === "undefined") return;
          idx += 1;
          const nameKey = `#k${idx}`;
          const valKey = `:v${idx}`;
          setParts.push(`${nameKey} = ${valKey}`);
          ExpressionAttributeNames[nameKey] = key;
          ExpressionAttributeValues[valKey] = updateData[key];
        });

        // always set updatedAt
        idx += 1;
        const nameKey = `#k${idx}`;
        const valKey = `:v${idx}`;
        setParts.push(`${nameKey} = ${valKey}`);
        ExpressionAttributeNames[nameKey] = "updatedAt";
        ExpressionAttributeValues[valKey] = new Date().toISOString();

        if (setParts.length === 0) return;

        const UpdateExpression = `SET ${setParts.join(", ")}`;

        await docClient.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { userId, expenseId },
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
          })
        );
      } catch (err) {
        console.warn("DynamoDB update failed:", err);
      }
    },
    [getDocClient]
  );

  // Delete an expense from DynamoDB (fire-and-forget)
  const deleteExpenseFromDynamo = useCallback(
    async (expenseId) => {
      try {
        const user = await getCurrentUser();
        const userId = user?.userId || user?.username;
        if (!userId) {
          console.warn("No authenticated user found - skipping DynamoDB sync");
          return;
        }

        const docClient = await getDocClient();

        await docClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { userId, expenseId },
          })
        );
      } catch (err) {
        console.warn("DynamoDB delete failed:", err);
      }
    },
    [getDocClient]
  );

  // Load expenses from DynamoDB for the current user
  const loadExpensesFromDynamo = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const userId = user?.userId || user?.username;
      if (!userId) {
        console.warn("No authenticated user found - cannot load from DynamoDB");
        return;
      }

      const docClient = await getDocClient();

      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
        })
      );

      if (result.Items && result.Items.length > 0) {
        // Convert DynamoDB items to expense format
        const loadedExpenses = result.Items.map((item) => ({
          id: item.expenseId,
          amount: item.amount,
          category: item.category,
          date: item.date,
          description: item.description,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        setExpenses(loadedExpenses);
        console.log(`Loaded ${loadedExpenses.length} expenses from DynamoDB`);
      }
    } catch (err) {
      console.warn("Failed to load expenses from DynamoDB:", err);
    }
  }, [getDocClient]);

  // Add a new expense
  const addExpense = useCallback(
    (expenseData) => {
      try {
        const newExpense = {
          id: uuidv4(),
          ...expenseData,
          amount: parseFloat(expenseData.amount),
          createdAt: new Date().toISOString(),
        };

        setExpenses((prev) => [newExpense, ...prev]);
        setError(null);
        // fire-and-forget: attempt to persist to DynamoDB
        try {
          void putExpenseToDynamo(newExpense);
        } catch (e) {
          // already logged in helper
        }

        return newExpense;
      } catch (err) {
        setError(err.message || "Failed to add expense");
        throw err;
      }
    },
    [putExpenseToDynamo]
  );

  // Update an expense
  const updateExpense = useCallback(
    (expenseId, updateData) => {
      try {
        setExpenses((prev) =>
          prev.map((expense) =>
            expense.id === expenseId
              ? {
                  ...expense,
                  ...updateData,
                  amount: parseFloat(updateData.amount || expense.amount),
                  updatedAt: new Date().toISOString(),
                }
              : expense
          )
        );
        setError(null);
        try {
          void updateExpenseInDynamo(expenseId, updateData);
        } catch (e) {}
      } catch (err) {
        setError(err.message || "Failed to update expense");
        throw err;
      }
    },
    [updateExpenseInDynamo]
  );

  // Delete an expense
  const deleteExpense = useCallback(
    (expenseId) => {
      try {
        setExpenses((prev) =>
          prev.filter((expense) => expense.id !== expenseId)
        );
        setError(null);
        try {
          void deleteExpenseFromDynamo(expenseId);
        } catch (e) {}
      } catch (err) {
        setError(err.message || "Failed to delete expense");
        throw err;
      }
    },
    [deleteExpenseFromDynamo]
  );

  // Get total spending
  const getTotalSpending = useCallback(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  // Get spending by category
  const getSpendingByCategory = useCallback(() => {
    const byCategory = {};
    expenses.forEach((expense) => {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = {
          total: 0,
          count: 0,
        };
      }
      byCategory[expense.category].total += expense.amount;
      byCategory[expense.category].count += 1;
    });
    return byCategory;
  }, [expenses]);

  // Get monthly spending
  const getMonthlySpending = useCallback(() => {
    const byMonth = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!byMonth[monthKey]) {
        byMonth[monthKey] = 0;
      }
      byMonth[monthKey] += expense.amount;
    });
    return byMonth;
  }, [expenses]);

  // Get expenses by date range
  const getExpensesByDateRange = useCallback(
    (startDate, endDate) => {
      return expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    },
    [expenses]
  );

  // Check if budget limit exceeded
  const isBudgetExceeded = useCallback(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return getTotalSpending() > budgetLimit;
  }, [getTotalSpending, budgetLimit]);

  // Get remaining budget
  const getRemainingBudget = useCallback(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return budgetLimit - getTotalSpending();
  }, [getTotalSpending, budgetLimit]);

  const value = {
    expenses,
    error,
    budgetLimit,
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalSpending,
    getSpendingByCategory,
    getMonthlySpending,
    getExpensesByDateRange,
    isBudgetExceeded,
    getRemainingBudget,
    setBudgetLimit,
    loadExpensesFromDynamo,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};
