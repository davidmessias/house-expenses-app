import { NextRequest, NextResponse } from 'next/server';
import { ddb, TABLE } from '@/lib/dynamo';
import { DeleteCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { requireUser } from '@/lib/auth';

function key(userId: string, sk: string) {
  return { TableName: TABLE, Key: { PK: `U#${userId}`, SK: sk } };
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await requireUser();
  const { id } = await context.params;
  const sk = decodeURIComponent(id); // Expect full SK (T#...#id)
  const res = await ddb.send(new GetCommand(key(userId, sk)));
  if (!res.Item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(res.Item);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await requireUser();
  const { id } = await context.params;
  const sk = decodeURIComponent(id);
  const body = await req.json();
  // Allow updating description, mode, amountCents, currency
  const exp: string[] = [];
  const vals: Record<string, unknown> = {};
  if (body.description !== undefined) { exp.push('description = :d'); vals[':d'] = body.description; }
  if (body.mode) { exp.push('mode = :m'); vals[':m'] = body.mode; }
  if (body.amountCents) { exp.push('amountCents = :a'); vals[':a'] = body.amountCents; }
  if (body.currency) { exp.push('currency = :c'); vals[':c'] = body.currency; }
  if (!exp.length) return NextResponse.json({ ok: true });
  await ddb.send(new UpdateCommand({ ...key(userId, sk), UpdateExpression: `SET ${exp.join(', ')}`, ExpressionAttributeValues: vals }));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const userId = await requireUser();
  const params = await context.params;
  const { id } = params;
  const sk = decodeURIComponent(id);
  try {
    await ddb.send(new DeleteCommand(key(userId, sk)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed', details: String(e) }, { status: 500 });
  }
}
