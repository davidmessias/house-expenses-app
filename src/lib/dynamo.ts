// src/lib/dynamo.ts
import 'server-only';
/**
 * 🔐 Credentials selection (no branching needed):
 * - LOCAL DEV: The AWS SDK v3 default provider chain will use your `.env.local`
 *   (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_SESSION_TOKEN) or your
 *   ~/.aws/{credentials,config} profile.
 * - AMPLIFY (deployed): The server runtime provides an IAM execution role; the
 *   SDK automatically picks those role credentials (via web identity/IMDS).
 * ✅ Do NOT set static AWS keys in Amplify env vars. Grant DynamoDB perms to the role.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.FINANCE_AWS_REGION!;
export const TABLE = process.env.DYNAMODB_TABLE!;

// Lazily create a single DocumentClient instance.
// We pass only `region` and rely on the default provider chain for credentials.
let _doc: DynamoDBDocumentClient | null = null;

function createDocClient(): DynamoDBDocumentClient {
  const base = new DynamoDBClient({ region: REGION }); // no explicit `credentials`
  return DynamoDBDocumentClient.from(base, {
    marshallOptions: { removeUndefinedValues: true },
  });
}

// Export a singleton instance. Because this module is marked `server-only`,
// attempting to import it from Client Components will error at build time.
export const ddb: DynamoDBDocumentClient = (() => {
  if (_doc) return _doc;
  _doc = createDocClient();
  return _doc;
})();
