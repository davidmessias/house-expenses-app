// app/api/transactions/route.ts
import 'server-only';
export const runtime = 'nodejs'; // Ensure Node.js (NOT Edge) so role-based creds are available

/**
 * 🔐 How credentials are chosen (no branching needed):
 *
 * We DO NOT pass `credentials` to the AWS SDK. Instead we rely on the
 * AWS SDK v3 **default credential provider chain**. That chain looks
 * for credentials in a fixed order and automatically uses the first
 * source it finds. Relevant steps for this app:
 *
 * 1) Environment variables (LOCAL DEV via `.env.local`)
 *    - If you define the standard AWS env vars locally (e.g., with Next.js
 *      `.env.local`), the SDK will use them:
 *        - AWS_ACCESS_KEY_ID
 *        - AWS_SECRET_ACCESS_KEY
 *        - AWS_SESSION_TOKEN (only if using temporary creds)
 *        - AWS_REGION or we pass region explicitly below
 *
 * 2) Shared config/credentials files (LOCAL DEV)
 *    - If you have `~/.aws/credentials` or `~/.aws/config` with a default
 *      or named profile, the SDK can use those too.
 *
 * 3) Web identity / IAM role credentials (AMPLIFY SERVER RUNTIME)
 *    - When deployed on AWS Amplify (server-side runtime for Next.js routes),
 *      the process runs with an **execution role** attached by the platform.
 *      The SDK picks up those role credentials automatically via the
 *      environment (web identity / IMDS), WITHOUT any keys in env vars.
 *
 * ✅ Bottom line:
 * - Locally: put your keys in `.env.local` or use your AWS profile.
 * - In Amplify: DO NOT set AWS_ACCESS_KEY_ID/SECRET in Amplify env vars.
 *   Attach DynamoDB permissions to the Amplify app's server execution role.
 *   The SDK will detect and use that role automatically.
 */

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';
import { ulid } from 'ulidx';

const REGION = process.env.FINANCE_AWS_REGION!;
const TABLE = process.env.DYNAMODB_TABLE!;

// Create a single DocumentClient instance.
// NOTE: We only pass `region`. We DO NOT pass `credentials`.
// This lets the default provider chain decide (see block above).
let _docClient: DynamoDBDocumentClient | null = null;
function ddb() {
  if (_docClient) return _docClient;

  const base = new DynamoDBClient({ region: REGION });

  _docClient = DynamoDBDocumentClient.from(base, {
    marshallOptions: { removeUndefinedValues: true },
  });
  return _docClient;
}

// === Validation schema ===
const CreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(['income', 'expense']),
  mode: z.union([
    z.enum(['cash', 'inbound_transfer', 'salary']),
    z.enum(['direct_debit', 'credit_card', 'transfer']),
  ]),
  direction: z.enum(['credit', 'debit']),
  description: z.string().max(500).optional(),
  currency: z.string().default('EUR'),
  amountCents: z.number().int().min(1),
});

// === GET: list & filtered queries ===
export async function GET(req: NextRequest) {
  const userId = await requireUser();
  const { searchParams } = new URL(req.url);
  const ym = searchParams.get('month'); // YYYY-MM
  const dir = searchParams.get('direction'); // credit|debit
  const mode = searchParams.get('mode');

  try {
    if (ym) {
      const res = await ddb().send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :p',
          ExpressionAttributeValues: { ':p': `U#${userId}#YM#${ym}` },
        }),
      );
      return NextResponse.json(res.Items ?? []);
    }

    if (dir) {
      const code = dir === 'credit' ? 'C' : 'D';
      const res = await ddb().send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: 'GSI2',
          KeyConditionExpression: 'GSI2PK = :p',
          ExpressionAttributeValues: { ':p': `U#${userId}#DIR#${code}` },
        }),
      );
      return NextResponse.json(res.Items ?? []);
    }

    if (mode) {
      const res = await ddb().send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: 'GSI3',
          KeyConditionExpression: 'GSI3PK = :p',
          ExpressionAttributeValues: { ':p': `U#${userId}#MODE#${mode}` },
        }),
      );
      return NextResponse.json(res.Items ?? []);
    }

    // default: latest 50 by SK descending
    const res = await ddb().send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :p',
        ExpressionAttributeValues: { ':p': `U#${userId}` },
        Limit: 50,
        ScanIndexForward: false,
      }),
    );
    return NextResponse.json(res.Items ?? []);
  } catch (err: unknown) {
    console.error('[API] GET /api/transactions - DynamoDB error', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'DynamoDB error', details: message },
      { status: 500 },
    );
  }
}

// === POST: create transaction ===
export async function POST(req: NextRequest) {
  const userId = await requireUser();
  const body = await req.json();
  console.log('[API] POST /api/transactions - raw body', body);

  let parsed: z.infer<typeof CreateSchema>;
  try {
    parsed = CreateSchema.parse(body);
    console.log('[API] POST /api/transactions - parsed body', parsed);
  } catch (err: unknown) {
    console.error('[API] POST /api/transactions - validation error', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Validation error', details: message }, { status: 400 });
  }

  // Domain rules
  if (parsed.kind === 'income' && parsed.direction !== 'credit') {
    console.error('[API] POST /api/transactions - invalid income direction', parsed);
    return NextResponse.json({ error: 'Income must be credit' }, { status: 400 });
  }
  if (parsed.kind === 'expense' && parsed.direction !== 'debit') {
    console.error('[API] POST /api/transactions - invalid expense direction', parsed);
    return NextResponse.json({ error: 'Expense must be debit' }, { status: 400 });
  }

  const id = ulid();
  const timestamp = new Date(`${parsed.date}T12:00:00.000Z`).toISOString();
  const yearMonth = parsed.date.slice(0, 7);

  const item = {
    PK: `U#${userId}`,
    SK: `T#${timestamp}#${id}`,
    GSI1PK: `U#${userId}#YM#${yearMonth}`,
    GSI1SK: `T#${timestamp}#${id}`,
    // If you have other GSIs (e.g., GSI2/GSI3), add their PK/SK here
    userId,
    id,
    timestamp,
    yearMonth,
    date: parsed.date,
    direction: parsed.direction,
    kind: parsed.kind,
    mode: parsed.mode,
    description: parsed.description,
    currency: parsed.currency,
    amountCents: parsed.amountCents,
  };

  // Debug: flag missing values
  Object.entries(item).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      console.warn(`[API] POST /api/transactions - missing or empty key: ${key}`, value);
    }
  });
  console.log('[API] POST /api/transactions - final item for PutCommand', item);

  try {
    await ddb().send(new PutCommand({ TableName: TABLE, Item: item }));
    console.log('[API] POST /api/transactions - item inserted', item);
    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    console.error('[API] POST /api/transactions - DynamoDB error', err, item);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'DynamoDB error', details: message },
      { status: 500 },
    );
  }
}
