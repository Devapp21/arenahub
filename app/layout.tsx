// app/layout.tsx
import "./globals.css";
import { Black_Ops_One } from "next/font/google";
import RootLayoutClient from "./RootLayoutClient"; // Client Component pour Navbar et modal

const blackOps = Black_Ops_One({ subsets: ["latin"], weight: "400", variable: "--font-blackops" });

export const metadata = {
  title: "Warzone Arena - Tournois Warzone",
  description: "Participez à nos tournois Warzone chaque semaine !",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Warzone Arena - Tournois Warzone",
    description: "Participez à nos tournois Warzone chaque semaine !",
    url: "https://www.warzone-arena.com",
    siteName: "Warzone Arena",
    images: [
      {
        url: "https://www.warzone-arena.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Warzone Arena - Tournois Warzone",
    description: "Participez à nos tournois Warzone chaque semaine !",
    images: ["https://www.warzone-arena.com/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${blackOps.variable} bg-black text-white`}>
      <body>
        {/* Client Component gérant Navbar, menu mobile et modal */}
        <RootLayoutClient />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
