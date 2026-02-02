import { ConversionHistoryEntry } from '../entities/ConversionHistory';

export interface GroupedHistory {
  date: string;
  entries: ConversionHistoryEntry[];
}

export const groupHistoryByDate = (
  entries: ConversionHistoryEntry[]
): GroupedHistory[] => {
  const groups: Record<string, ConversionHistoryEntry[]> = {};

  for (const entry of entries) {
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({ date, entries }));
};
