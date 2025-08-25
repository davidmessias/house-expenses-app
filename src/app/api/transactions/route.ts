import { NextRequest, NextResponse } from 'next/server';
import { ddb, TABLE } from '@/lib/dynamo';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';
import { ulid } from 'ulidx';

const CreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(['income','expense']),
  mode: z.union([
    z.enum(['cash','inbound_transfer','salary']),
    z.enum(['direct_debit','credit_card','transfer'])
  ]),
  direction: z.enum(['credit','debit']),
  description: z.string().max(500).optional(),
  currency: z.string().default('EUR'),
  amountCents: z.number().int().min(1)
});

export async function GET(req: NextRequest) {
  const userId = await requireUser();
  const { searchParams } = new URL(req.url);
  const ym = searchParams.get('month'); // YYYY-MM
  const dir = searchParams.get('direction'); // credit|debit
  const mode = searchParams.get('mode');

  if (ym) {
      const res = await ddb.send(new QueryCommand({
        TableName: TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :p',
        ExpressionAttributeValues: { ':p': `U#${userId}#YM#${ym}` }
      }));
    return NextResponse.json(res.Items ?? []);
  }
  if (dir) {
    const code = dir === 'credit' ? 'C' : 'D';
    const res = await ddb.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :p',
      ExpressionAttributeValues: { ':p': `U#${userId}#DIR#${code}` }
    }));
    return NextResponse.json(res.Items ?? []);
  }
  if (mode) {
    const res = await ddb.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :p',
      ExpressionAttributeValues: { ':p': `U#${userId}#MODE#${mode}` }
    }));
    return NextResponse.json(res.Items ?? []);
  }
  // default: latest 50
  const res = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :p',
    ExpressionAttributeValues: { ':p': `U#${userId}` },
    Limit: 50,
    ScanIndexForward: false
  }));
  return NextResponse.json(res.Items ?? []);
}

export async function POST(req: NextRequest) {
  const userId = await requireUser();
  const body = await req.json();
  console.log('[API] POST /api/transactions - raw body', body);
  let parsed;
  try {
    parsed = CreateSchema.parse(body);
    console.log('[API] POST /api/transactions - parsed body', parsed);
  } catch (err) {
    console.error('[API] POST /api/transactions - validation error', err);
    return NextResponse.json({ error: 'Validation error', details: err }, { status: 400 });
  }

  // Validate allowed combos
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
  const yearMonth = parsed.date.slice(0,7);

  const item = {
    PK: `U#${userId}`,
    SK: `T#${timestamp}#${id}`,
    GSI1PK: `U#${userId}#YM#${yearMonth}`,
    GSI1SK: `T#${timestamp}#${id}`,
    // If you have other GSIs, add them here with uppercase names as per your table definition
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
    amountCents: parsed.amountCents
  };

  // Log all keys and values for debugging
  Object.entries(item).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      console.warn(`[API] POST /api/transactions - missing or empty key: ${key}`, value);
    }
  });
  console.log('[API] POST /api/transactions - final item for PutCommand', item);

  try {
    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    console.log('[API] POST /api/transactions - item inserted', item);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error('[API] POST /api/transactions - DynamoDB error', err, item);
    return NextResponse.json({ error: 'DynamoDB error', details: err }, { status: 500 });
  }
}
