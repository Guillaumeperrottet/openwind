import { TripPlanner } from "@/components/plan/TripPlanner";

export const metadata = {
  title: "Planifier un voyage — OpenKite",
  description:
    "Trouvez les meilleurs spots kite à proximité de votre destination avec les prévisions vent.",
};

export default function PlanPage() {
  return (
    <div
      className="bg-white text-gray-900"
      style={{ height: "calc(100vh - 56px)" }}
    >
      <TripPlanner />
    </div>
  );
}
