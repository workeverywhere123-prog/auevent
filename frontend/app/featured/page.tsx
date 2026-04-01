import { fetchEvents } from "@/lib/api";
import FeaturedClient from "@/components/featured/FeaturedClient";

export default async function FeaturedPage() {
  const allEvents = await fetchEvents();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <FeaturedClient allEvents={allEvents} />
    </div>
  );
}
