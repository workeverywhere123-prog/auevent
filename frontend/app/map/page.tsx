import { fetchEvents } from "@/lib/api";
import MapPageClient from "@/components/map/MapPageClient";

export default async function MapPage() {
  const events = await fetchEvents();
  return <MapPageClient events={events} />;
}
