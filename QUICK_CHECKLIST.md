# AWS Configuration - Quick Checklist

## Your Current Setup

- **AWS Account ID:** `873828695513`
- **Region:** `ap-south-1`
- **DynamoDB Table:** `expenses`
- **Partition Key:** `userId` (String)
- **Sort Key:** `expenseId` (String)

---

## Cognito Configuration

- **User Pool ID:** `ap-south-1_OxUvHWqx1`
- **User Pool Client ID:** `76ef4o66hsegmfkmo1t52p3f5o`
- **Identity Pool ID:** `ap-south-1:23098f39-92a9-4ca5-b9dd-98f8741bbfc1`

---

## IAM Role Configuration

- **Role Name:** `mycredentials-2`
- **Role ARN:** `arn:aws:iam::873828695513:role/service-role/mycredentials-2`

---

## ✅ Setup Checklist

### Step 1: Assign Role to Identity Pool

- [ ] Go to AWS Cognito Console
- [ ] Find Identity Pool: `ap-south-1:23098f39-92a9-4ca5-b9dd-98f8741bbfc1`
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
2. Make sure role ARN is correct: `arn:aws:iam::873828695513:role/service-role/mycredentials-2`
3. Verify trust relationships in the role

### If you see "not authorized to perform: dynamodb:PutItem"

1. Check DynamoDB policy is attached to `mycredentials-2`
2. Verify Resource ARN: `arn:aws:dynamodb:ap-south-1:873828695513:table/expenses`
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
