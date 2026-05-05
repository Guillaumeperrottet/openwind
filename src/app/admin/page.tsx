import Link from "next/link";
import { Megaphone, ArrowLeft, Shield, MessagesSquare } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à la carte
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-sm text-gray-500">
              Espace d'administration Openwind.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/banner"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-sky-300"
          >
            <div className="mb-2 inline-flex rounded-lg bg-sky-50 p-2 text-sky-600 group-hover:bg-sky-100">
              <Megaphone className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              Bandeau publicitaire
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Modifier le texte, l'URL, l'activation et la vitesse du
              défilement.
            </p>
          </Link>

          <Link
            href="/forum"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-sky-300"
          >
            <div className="mb-2 inline-flex rounded-lg bg-sky-50 p-2 text-sky-600 group-hover:bg-sky-100">
              <MessagesSquare className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              Modération forum
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Accéder au forum pour gérer les catégories, éditer et supprimer
              les contenus en tant qu'admin.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
