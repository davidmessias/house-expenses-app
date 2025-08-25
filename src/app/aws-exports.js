// AWS Amplify configuration
const awsConfig = {
  aws_project_region: 'eu-central-1',
  aws_cognito_region: 'eu-central-1',
  aws_user_pools_id: '<COGNITO_USER_POOL_ID>',
  aws_user_pools_web_client_id: '<COGNITO_CLIENT_ID>',
  aws_dynamodb_table: 'HouseExpenses',
  aws_dynamodb_region: 'eu-central-1',
  aws_cloudfront_distribution: '<CLOUDFRONT_DIST_ID>',
  aws_amplify_app_id: '<AMPLIFY_APP_ID>'
};
export default awsConfig;
