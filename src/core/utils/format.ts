export const formatNumber = (num: number): string => {
  const fixed = num.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decPart === '00' ? formattedInt : `${formattedInt},${decPart}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (dateString: string): string =>
  new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

const DAY_MS = 24 * 60 * 60 * 1000;

/** "Today", "Yesterday", "October 3" or "October 3, 2025" for a "YYYY-MM-DD" key */
export const formatDay = (dateKey: string, now: Date = new Date()): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAgo = Math.round((today.getTime() - date.getTime()) / DAY_MS);

  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: year === now.getFullYear() ? undefined : 'numeric',
  });
};
