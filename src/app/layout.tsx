import { headers } from "next/headers";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") ?? "fr";

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
