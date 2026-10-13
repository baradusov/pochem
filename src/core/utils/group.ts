import { ConversionHistoryEntry } from '../entities/ConversionHistory';

export interface GroupedHistory {
  date: string;
  entries: ConversionHistoryEntry[];
}

/** "2026-10-09" in the device's time zone, so late-night entries stay on their day */
export const localDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const groupHistoryByDate = (
  entries: ConversionHistoryEntry[]
): GroupedHistory[] => {
  const groups: Record<string, ConversionHistoryEntry[]> = {};

  for (const entry of entries) {
    const date = localDateKey(new Date(entry.timestamp));
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({ date, entries }));
};
