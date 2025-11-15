// app/layout.tsx
import "./globals.css";
import { Black_Ops_One } from "next/font/google";
import Link from "next/link";

const blackOps = Black_Ops_One({ subsets: ["latin"], weight: "400", variable: "--font-blackops" });

// ✅ --- META / FAVICON / OPEN GRAPH ---
export const metadata = {
  title: "Warzone Arena - Tournois Warzone",
  description: "Participez à nos tournois Warzone chaque semaine !",
  icons: {
    icon: "/favicon.ico", // favicon classique
  },
  openGraph: {
    title: "Warzone Arena - Tournois Warzone",
    description: "Participez à nos tournois Warzone chaque semaine !",
    url: "https://www.warzone-arena.com",
    siteName: "Warzone Arena",
    images: [
      {
        url: "/og-image.png", // ton image OG 1200x630
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
    images: ["/og-image.png"],
  },
};

// ✅ --- LE LAYOUT DOIT EXPORTER DEFAULT ---
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${blackOps.variable} bg-black text-white`}>
      <body>
        {/* Ici tu peux mettre ta navbar ou tout autre composant global */}
        {children}
      </body>
    </html>
  );
}
