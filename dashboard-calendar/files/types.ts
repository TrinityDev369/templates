export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  category?: string;
  allDay?: boolean;
}

export type CalendarView = 'month' | 'week' | 'day';
