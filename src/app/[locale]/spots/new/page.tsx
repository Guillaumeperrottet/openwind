import { CreateSpotForm } from "@/components/spot/CreateSpotForm";
import { SpotContributionGate } from "@/components/spot/SpotContributionGate";

export const metadata = {
  title: "Ajouter un spot",
  description:
    "Partagez un spot de kitesurf ou parapente avec la communauté open source OpenWind.",
  robots: { index: false, follow: false },
};

export default function NewSpotPage() {
  return <SpotContributionGate><CreateSpotForm /></SpotContributionGate>;
}
