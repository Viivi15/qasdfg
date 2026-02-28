export function addMonths(date: Date | string, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);

  // handle month overflow
  if (d.getDate() < day) d.setDate(0);
  return d;
}

export function daysBetween(a: Date | string, b: Date | string) {
  const ms = new Date(b).setHours(0,0,0,0) - new Date(a).setHours(0,0,0,0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
