# AWS Setup Guide for Daily Expense Tracker (Updated for New AWS Cognito)

This guide will help you configure AWS (with the new Cognito console) so the app can sync expenses to DynamoDB.

## Current Status

✅ DynamoDB table created: `expenses`  
✅ Cognito User Pool configured  
✅ Identity Pool created: `ap-south-1:23098f39-92a9-4ca5-b9dd-98f8741bbfc1`  
✅ IAM Role created: `arn:aws:iam::873828695513:role/service-role/mycredentials-2`  
⏳ **IN PROGRESS:** Attach DynamoDB permissions to IAM role

---

## Option 1: Using New AWS Cognito Console (Recommended)

### Step 1: Navigate to Identity Pools (New Console)

1. Go to **[AWS Console](https://console.aws.amazon.com)**
2. Search for **"Cognito"** and click it
3. In the sidebar, click **"Identity Pools"** (or **"Federated Identities"**)
4. Find your pool: `ap-south-1:23098f39-92a9-4ca5-b9dd-98f8741bbfc1`
5. Click on it to open

### Step 2: Assign Your IAM Role to Identity Pool

1. In the Identity Pool, click **"Edit identity pool"** (top right)
2. Scroll to **"IAM Roles"** section
3. **For Authenticated role:**
   - Select: `mycredentials-2` (the role you just created)
4. **For Unauthenticated role:**
   - You can use the same role or create a separate one
   - If using same, select: `mycredentials-2`
5. Click **"Save Changes"**

### Step 3: Add DynamoDB Permissions to Your Role

1. Go to **[AWS IAM Console](https://console.aws.amazon.com/iam)** → **Roles**
2. Search for: **`mycredentials-2`**
3. Click on the role to open it
4. Click **"Add inline policy"** (or **"Create inline policy"**)
5. Choose **JSON** editor tab
6. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:873828695513:table/expenses"
    }
  ]
}
```

7. Click **"Review policy"** or **"Next"**
8. Give it a name: `DynamoDB`
9. Click **"Create policy"**

### Step 4: Verify Configuration

1. Return to the app at `http://localhost:3000`
2. Sign up or log in with a Cognito user
3. Add a new expense
4. Open **Browser DevTools** (F12) → **Console**
5. Look for one of these messages:
   - ✅ **"✓ Credentials retrieved successfully"** - DynamoDB is configured!
   - ❌ **"Failed to get AWS credentials"** - Check the error message

### Step 5: Test DynamoDB Sync

Once you see "✓ Credentials retrieved successfully":

1. Add a new expense through the app
2. Check the console for: **"Expense successfully synced to DynamoDB"**
3. Go to **AWS Console** → **DynamoDB** → **Tables** → **expenses** → **Explore items**
4. You should see your expense entry!

---

## Option 2: Using Old AWS Console (Legacy)

If the new console doesn't work or you prefer the old interface:

### Step 1: Access Identity Pools (Old Console)

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Click **"Manage Federated Identities"** or **"Go to the Identity Pools console"**
3. Find your pool: `ap-south-1:23098f39-92a9-4ca5-b9dd-98f8741bbfc1`

### Step 2: Edit Trust Relationship

1. Click on your Identity Pool
2. Click **"Edit Identity Pool"** (top right)
3. Under **"Authentication Providers"**, add your User Pool:
   - Provider name: `cognito-idp.ap-south-1.amazonaws.com/ap-south-1_OxUvHWqx1:76ef4o66hsegmfkmo1t52p3f5o`
4. Click **"Save Changes"**

### Step 3: Manage IAM Roles

1. Click **"Edit identity pool"** again
2. Scroll down to **"IAM Roles"**
3. Create new roles if needed:
   - **Authenticated**: `Cognito_ExpenseTrackerAuth_Role`
   - **Unauthenticated**: `Cognito_ExpenseTrackerUnauth_Role`
4. Click **"Allow"** and **"Save Changes"**

### Step 4: Add Permissions to Authenticated Role

1. Go to **IAM Console** → **Roles**
2. Find `Cognito_ExpenseTrackerAuth_Role`
3. Click **"Add inline policy"**
4. Paste the same DynamoDB policy (see above)
5. Complete and save

---

## Troubleshooting

### Error: "Invalid identity pool configuration. Check assigned IAM roles for this pool"

**Solutions:**

1. Make sure the Identity Pool has an Authenticated IAM role assigned
2. Verify the role is linked to your Cognito User Pool
3. Check that trust relationships are configured correctly

### Error: "User: arn:aws:iam::... is not authorized to perform: dynamodb:PutItem"

**Solutions:**

1. The IAM role doesn't have DynamoDB permissions
2. Make sure the policy is attached to the correct authenticated role
3. Check the Resource ARN in the policy matches your table exactly

### Error: "No credentials found in session"

**Solutions:**

1. User might not be authenticated - try signing out and back in
2. Session may have expired - refresh the page
3. Check browser console for more details

### App working but DynamoDB not syncing

**Don't worry!** The app is designed to work offline:

- All expenses are stored locally in the browser
- They'll sync to DynamoDB once IAM is configured
- No data is lost

### "Credentials retrieved successfully" but expenses not saving

**Check:**

1. User is actually logged in
2. DynamoDB table exists in `ap-south-1`
3. Table name is exactly `expenses` (case-sensitive)
4. IAM policy Resource ARN matches your account ID: `873828695513`

---

## AWS Architecture

```
┌─────────────────┐
│   React App     │
└────────┬────────┘
         │ Authenticate
         ▼
┌─────────────────────────┐
│  Cognito User Pool      │
│  (ap-south-1_OxUvHWqx1) │
└────────┬────────────────┘
         │ Provides temporary credentials
         ▼
┌─────────────────────────────────────┐
│  Cognito Identity Pool              │
│  (ap-south-1:23098f39-92a9-...)     │
└────────┬────────────────────────────┘
         │ Assumes IAM role
         ▼
┌──────────────────────────┐
│  IAM Authenticated Role  │
│  (with DynamoDB perms)   │
└────────┬─────────────────┘
         │ Access granted
         ▼
┌──────────────────────┐
│  DynamoDB Table      │
│  (expenses)          │
└──────────────────────┘
```

---

## Configuration Reference

| Setting                 | Value                                             |
| ----------------------- | ------------------------------------------------- |
| **AWS Region**          | `ap-south-1`                                      |
| **User Pool ID**        | `ap-south-1_OxUvHWqx1`                            |
| **User Pool Client ID** | `76ef4o66hsegmfkmo1t52p3f5o`                      |
| **Identity Pool ID**    | `ap-south-1:23098f39-92a9-4ca5-b9dd-98f8741bbfc1` |
| **DynamoDB Table**      | `expenses`                                        |
| **Partition Key**       | `userId` (String)                                 |
| **Sort Key**            | `expenseId` (String)                              |
| **App Config File**     | `src/config/awsConfig.js`                         |

---

## Quick Checklist

- [ ] Identity Pool has Authenticated IAM role
- [ ] Identity Pool has Unauthenticated IAM role
- [ ] Cognito User Pool is trusted provider in Identity Pool
- [ ] DynamoDB policy attached to Authenticated role
- [ ] DynamoDB table `expenses` exists in `ap-south-1`
- [ ] App can authenticate users (sign in works)
- [ ] Browser console shows "✓ Credentials retrieved successfully"
- [ ] Expenses sync to DynamoDB (check AWS console)

---

## Need More Help?

1. Check **Browser DevTools Console** (F12) for detailed error messages
2. Check **AWS CloudWatch Logs** for service-side errors
3. Verify all ARNs and IDs are correct (copy-paste to avoid typos)
4. Make sure you're in the correct AWS region: `ap-south-1`
5. Refresh the page after making AWS changes
   │ (expenses) │
   └──────────────────────┘

```

## Key Configuration Files

- **Identity Pool ID:** `ap-south-1:23098f39-92a9-4ca5-b9dd-98f8741bbfc1`
- **DynamoDB Table:** `expenses`
- **DynamoDB Region:** `ap-south-1`
- **Partition Key:** `userId` (String)
- **Sort Key:** `expenseId` (String)
- **App Config:** `src/config/awsConfig.js`

## Next Steps

1. ✅ Complete all steps above
2. ✅ Verify credentials are working
3. ✅ Test adding/updating/deleting expenses
4. 🎉 You're done! Expenses will now sync to DynamoDB

Need help? Check the browser console (F12) for detailed error messages!
```
