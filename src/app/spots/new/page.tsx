import { CreateSpotForm } from "@/components/spot/CreateSpotForm";

export const metadata = {
  title: "Ajouter un spot — OpenKite",
  description:
    "Partagez un spot de kitesurf ou parapente avec la communauté open source.",
};

export default function NewSpotPage() {
  return <CreateSpotForm />;
}
