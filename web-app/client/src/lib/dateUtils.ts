import { format, formatRelative, isToday, isYesterday, differenceInCalendarDays } from "date-fns";
import { enIN } from "date-fns/locale";

// Format date for inline display in transaction list
export function getInlineDateString(date: Date): string {
  if (isToday(date)) {
    return `Today, ${format(date, "h:mm a", { locale: enIN })}`;
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a", { locale: enIN })}`;
  } else if (differenceInCalendarDays(new Date(), date) < 7) {
    return format(date, "EEEE, h:mm a", { locale: enIN });
  } else {
    return format(date, "d MMM yyyy, h:mm a", { locale: enIN });
  }
}

// Get month name from month index (0-11)
export function getMonthName(monthIndex: number): string {
  const date = new Date();
  date.setMonth(monthIndex);
  return format(date, "MMMM", { locale: enIN });
}

// Format relative date for last sync timestamp
export function formatRelativeDate(date: Date): string {
  return formatRelative(date, new Date(), { locale: enIN });
}

// Format date in Indian format (DD/MM/YYYY)
export function formatIndianDate(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: enIN });
}

// Get month and year as display string (May 2023)
export function getMonthYearString(month: number, year: number): string {
  const date = new Date(year, month);
  return format(date, "MMMM yyyy", { locale: enIN });
}
