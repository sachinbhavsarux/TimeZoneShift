import { formatInTimeZone } from 'date-fns-tz';
import { addMinutes, differenceInMinutes } from 'date-fns';

export const getTimeInTimeZone = (date: Date, timezone: string) => {
  return formatInTimeZone(date, timezone, 'h:mm');
};

export const getFullDateInTimeZone = (date: Date, timezone: string) => {
  return formatInTimeZone(date, timezone, 'EEEE, MMM d');
};

export const getAmPmInTimeZone = (date: Date, timezone: string) => {
  return formatInTimeZone(date, timezone, 'a');
};

export const getTimeOffset = (baseTimezone: string, targetTimezone: string, date: Date = new Date()) => {
  const baseDate = new Date(formatInTimeZone(date, baseTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"));
  const targetDate = new Date(formatInTimeZone(date, targetTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"));
  
  const diff = differenceInMinutes(targetDate, baseDate);
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / 60);
  const mins = absDiff % 60;
  const sign = diff >= 0 ? '+' : '-';
  
  if (mins === 0) return `${sign}${hours}h`;
  return `${sign}${hours}h ${mins}m`;
};

export const getDayRelative = (baseDate: Date, targetDate: Date) => {
  const baseDay = baseDate.getDate();
  const targetDay = targetDate.getDate();
  
  if (targetDay > baseDay) return 'Tomorrow';
  if (targetDay < baseDay) return 'Yesterday';
  return 'Today';
};
