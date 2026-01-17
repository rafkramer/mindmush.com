export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateRange(start: Date, end: Date): string {
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
}

export function getDateRange(range: number | 'all'): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  if (range === 'all') {
    start.setFullYear(2020, 0, 1);
  } else {
    start.setDate(start.getDate() - range);
  }
  return { start, end };
}

export function filterByDateRange<T extends { date: string }>(
  items: T[],
  range: number | 'all'
): T[] {
  const { start, end } = getDateRange(range);
  return items.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
}

// Apple payout schedule
export function getNextApplePayoutDate(): Date {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  let payoutDate = new Date(lastMonth.getTime() + 45 * 24 * 60 * 60 * 1000);
  if (payoutDate < today) {
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    payoutDate = new Date(thisMonthEnd.getTime() + 45 * 24 * 60 * 60 * 1000);
  }
  return payoutDate;
}

export function getDaysUntilPayout(): number {
  const payoutDate = getNextApplePayoutDate();
  const today = new Date();
  return Math.ceil((payoutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
