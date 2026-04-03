"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Route, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Carte", icon: MapPin },
  { href: "/plan", label: "Planifier", icon: Route },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-4 bg-white border-b border-gray-100 shadow-sm">
      <Link href="/" className="flex items-center shrink-0">
        <Image
          src="/logo_noback.png"
          alt="OpenKite"
          width={90}
          height={26}
          className="h-7 w-auto"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </Link>

      <nav className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
              pathname === href
                ? "bg-sky-50 text-sky-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        <Link
          href="/spots/new"
          className="ml-2 flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter un spot
        </Link>
      </nav>
    </header>
  );
}
