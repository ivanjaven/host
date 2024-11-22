export function set12PMTime(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(12, 0, 0, 0);
  return newDate;
}
