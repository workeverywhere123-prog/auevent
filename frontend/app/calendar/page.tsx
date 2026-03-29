import { fetchEvents } from "@/lib/api";
import CalendarClient from "@/components/calendar/CalendarClient";

export default async function CalendarPage() {
  const events = await fetchEvents();
  return <CalendarClient events={events} />;
}
