// Configure Amplify with your AWS Cognito credentials
// To find your Identity Pool ID:
// 1. Go to AWS Console > Cognito > Identity Pools
// 2. Select your identity pool
// 3. Copy the Identity Pool ID (format: ap-south-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
const awsConfig = {
  Auth: {
    Cognito: {
      region: "ap-south-1",
      userPoolId: "ap-south-1_OxUvHWqx1",
      userPoolClientId: "76ef4o66hsegmfkmo1t52p3f5o",
      identityPoolId: "ap-south-1:23098f39-92a9-4ca5-b9dd-98f8741bbfc1",
    },
  },
};

export default awsConfig;
