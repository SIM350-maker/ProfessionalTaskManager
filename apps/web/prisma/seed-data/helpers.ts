// Kenyan Context Seed Data — Helpers

export function randomDate(daysAgo: number, daysAhead: number): Date {
  const now = new Date();
  const range = daysAgo + daysAhead;
  const offset = Math.floor(Math.random() * range) - daysAgo;
  const result = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
  return result;
}

export function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
