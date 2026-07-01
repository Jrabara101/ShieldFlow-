import { PayloadEntry, PayloadData } from '../types';

export function parseCSV(csvText: string): PayloadEntry[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) throw new Error('Empty CSV');

  const headers = lines[0]
    .split(',')
    .map(h => h.trim().toLowerCase());

  const recipientIdx = headers.indexOf('recipient_address');
  const amountIdx = headers.indexOf('amount');
  const didIdx = headers.indexOf('did');
  const taxIdx = headers.indexOf('tax_jurisdiction');

  if (recipientIdx === -1 || amountIdx === -1) {
    throw new Error('CSV must contain recipient_address and amount columns');
  }

  const entries: PayloadEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = line.split(',').map(f => f.trim());
    entries.push({
      recipient_address: fields[recipientIdx],
      amount: fields[amountIdx],
      did: didIdx >= 0 ? fields[didIdx] : undefined,
      tax_jurisdiction: taxIdx >= 0 ? fields[taxIdx] : undefined,
    });
  }

  return entries;
}

export function buildPayloadData(entries: PayloadEntry[]): PayloadData {
  let totalAmount = BigInt(0);

  for (const entry of entries) {
    const amount = BigInt(
      Math.floor(parseFloat(entry.amount) * 1e7)
    );
    totalAmount += amount;
  }

  return {
    entries,
    totalAmount,
    recipientCount: entries.length,
  };
}

export function validatePayload(data: PayloadData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.recipientCount === 0) {
    errors.push('No recipients in batch');
  }

  if (data.recipientCount > 500) {
    errors.push(`Too many recipients (${data.recipientCount} > 500)`);
  }

  if (data.totalAmount === BigInt(0)) {
    errors.push('Total amount is zero');
  }

  for (const entry of data.entries) {
    if (!entry.recipient_address.startsWith('G') || entry.recipient_address.length !== 56) {
      errors.push(`Invalid Stellar address: ${entry.recipient_address}`);
    }

    const amount = parseFloat(entry.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Invalid amount for ${entry.recipient_address}: ${entry.amount}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function formatAmount(stroops: bigint): string {
  const xlm = Number(stroops) / 1e7;
  return xlm.toFixed(7).replace(/\.?0+$/, '');
}
