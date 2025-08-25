export function toCents(input: string | number): number {
  const n = typeof input === 'number' ? input : Number(input.replace(',', '.'));
  if (!isFinite(n)) throw new Error('Invalid amount');
  return Math.round(n * 100);
}
export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}
