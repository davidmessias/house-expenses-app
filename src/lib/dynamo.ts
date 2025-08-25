import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let client: DynamoDBClient;
if (process.env.FINANCE_ENV === 'development') {
  // Use local credentials if available
  client = new DynamoDBClient({
    region: process.env.FINANCE_AWS_REGION,
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
      : undefined,
  });
} else {
  // Use IAM role on server (Amplify)
  client = new DynamoDBClient({ region: process.env.FINANCE_AWS_REGION });
}
export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true }
});
export const TABLE = process.env.DYNAMODB_TABLE!;
