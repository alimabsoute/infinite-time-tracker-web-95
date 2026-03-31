import Calendar from '@/pages/Calendar';

/**
 * CalendarPage — thin shell
 * Delegates to the existing Calendar component which renders Navigation,
 * CalendarContent with session fetching, filtering, and PDF export.
 */
export default function CalendarPage() {
  return <Calendar />;
}
