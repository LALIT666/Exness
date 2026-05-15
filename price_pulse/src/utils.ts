export const PRECISION = 10000;

export function toInternalPrice(price: number | string): number {
  // Convert to integer with 4 decimal places (matching spec)
  return Math.round(parseFloat(price as any) * PRECISION);
}

export function fromInternalPrice(price: bigint): number {
  return Number(price) / PRECISION;
}
