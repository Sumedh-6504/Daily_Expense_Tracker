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

# AWS Configuration - Quick Checklist

## Your Current Setup

- **AWS Account ID:** `<YOUR_ACCOUNT_ID>`
- **Region:** `<YOUR_REGION>`
- **DynamoDB Table:** `expenses`
- **Partition Key:** `userId` (String)
- **Sort Key:** `expenseId` (String)

---

## Cognito Configuration

- **User Pool ID:** `<YOUR_USER_POOL_ID>`
- **User Pool Client ID:** `<YOUR_USER_POOL_CLIENT_ID>`
- **Identity Pool ID:** `<YOUR_IDENTITY_POOL_ID>`

---

## IAM Role Configuration

- **Role Name:** `mycredentials-2`
- **Role ARN:** `<YOUR_ROLE_ARN>`

---

## ✅ Setup Checklist

### Step 1: Assign Role to Identity Pool

- [ ] Go to AWS Cognito Console
- [ ] Find Identity Pool: `<YOUR_IDENTITY_POOL_ID>`
- [ ] Click "Edit identity pool"
- [ ] Set **Authenticated role** to: `mycredentials-2`
- [ ] Set **Unauthenticated role** to: `mycredentials-2` (or create another)
- [ ] Click "Save Changes"

### Step 2: Add DynamoDB Permissions

- [ ] Go to IAM Console → Roles
- [ ] Search for: `mycredentials-2`
- [ ] Click on the role
- [ ] Click "Add inline policy"
- [ ] Paste the DynamoDB policy (see AWS_SETUP_GUIDE.md)
- [ ] Name it: `DynamoDB`
- [ ] Click "Create policy"

### Step 3: Configure Trust Relationships

- [ ] Go to Role: `mycredentials-2`
- [ ] Click "Trust relationships" tab
- [ ] Verify it trusts Cognito service
- [ ] Should include: `"cognito-identity.amazonaws.com"`

### Step 4: Test the App

- [ ] Restart the app (`npm start`)
- [ ] Sign up or log in
- [ ] Add a new expense
- [ ] Open Browser DevTools (F12) → Console
- [ ] Look for: ✅ "✓ Credentials retrieved successfully"
- [ ] Look for: ✅ "Expense successfully synced to DynamoDB"

### Step 5: Verify in AWS Console

- [ ] Go to DynamoDB Console
- [ ] Click Table: `expenses`
- [ ] Click "Explore items"
- [ ] Should see your expense data!

---

## 🔍 Troubleshooting

### If you see "Invalid identity pool configuration"

1. Check Identity Pool has authenticated role assigned
2. Make sure role ARN is correct: `<YOUR_ROLE_ARN_FOR_IDENTITY_POOL>`
3. Verify trust relationships in the role

### If you see "not authorized to perform: dynamodb:PutItem"

1. Check DynamoDB policy is attached to `mycredentials-2`
2. Verify Resource ARN: `<YOUR_ARN_RESOURCE_NAME>`
3. Make sure all DynamoDB actions are included

### If you see "No credentials found in session"

1. Try signing out and signing back in
2. Refresh the page
3. Check browser console for detailed error

### If everything looks good but still not working

1. Wait 1-2 minutes (AWS permissions take time to propagate)
2. Clear browser cache
3. Refresh the page
4. Try adding a new expense again

---

## Quick Test Commands

### Test if role has proper trust

Go to IAM → Roles → mycredentials-2 → Trust relationships
Should show:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### Test if DynamoDB policy is attached

Go to IAM → Roles → mycredentials-2 → Permissions
Should show: `DynamoDBExpensesAccess` inline policy

### Test if Identity Pool is configured

Go to Cognito → Identity Pools → Click your pool
Should show:

- Authenticated role: `mycredentials-2`
- Unauthenticated role: assigned

---

## Expected Browser Console Output

### ✅ Success Messages

```
✓ Credentials retrieved successfully from Identity Pool
Expense successfully synced to DynamoDB: [expense-id]
Loaded 3 expenses from DynamoDB
```

### ❌ Error Messages (Fix These)

```
Invalid identity pool configuration. Check assigned IAM roles
→ Fix: Assign mycredentials-2 to Identity Pool

User: arn:aws:iam::... is not authorized to perform: dynamodb:PutItem
→ Fix: Add DynamoDB policy to mycredentials-2 role

No credentials found in Amplify session
→ Fix: Check Identity Pool has authenticated role
```

---

## Next Steps After Setup

1. ✅ Users can now add/edit/delete expenses
2. ✅ All expenses sync to DynamoDB automatically
3. ✅ User's expenses are isolated by userId
4. 🎉 You're done! The app is fully configured!

---

## Need Help?

1. Check AWS_SETUP_GUIDE.md for detailed steps
2. Review browser console (F12) for error messages
3. Verify all ARNs and IDs match exactly
4. Make sure you're in region: `ap-south-1`
5. Wait 1-2 minutes after making changes for permissions to propagate



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

You have to install the required dependencies, you can run:

### `npm install`
### `npm install @aws-sdk/client-sns`

You have to add your secret environment variables before you begin the development site:
### `const REGION = "<YOUR_REGION>"; // e.g. "ap-south-1"`
### `const TOPIC_ARN = "<YOUR_TOPIC_ARN>";`
### `const ACCESS_KEY_ID = "<YOUR_ACCESS_KEY_ID>";`
### `const SECRET_ACCESS_KEY = "<YOUR_SECRET_ACCESS_KEY>";`

You can continue from here👇

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
