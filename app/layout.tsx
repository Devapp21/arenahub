// app/layout.tsx
import "./globals.css";
import { Black_Ops_One } from "next/font/google";
import Link from "next/link";
import { ReactNode } from "react";

const blackOps = Black_Ops_One({ subsets: ["latin"], weight: "400", variable: "--font-blackops" });

// ✅ --- META / FAVICON / OPEN GRAPH / TWITTER ---
export const metadata = {
  title: "Warzone Arena - Tournois Warzone",
  description: "Participez à nos tournois Warzone chaque semaine !",
  icons: {
    icon: "/favicon.ico", // favicon classique
  },
  openGraph: {
    title: "Warzone Arena - Tournois Warzone",
    description: "Participez à nos tournois Warzone chaque semaine !",
    url: "https://www.warzone-arena.com", // URL complète
    siteName: "Warzone Arena",
    images: [
      {
        url: "https://www.warzone-arena.com/og-image.png", // URL complète OG
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
    images: ["https://www.warzone-arena.com/og-image.png"], // URL complète OG
  },
};

// ✅ --- DEFAULT LAYOUT EXPORT ---
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${blackOps.variable} bg-black text-white`}>
      <head>
        {/* Favicon pour navigateur */}
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph */}
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content={metadata.openGraph.images[0].width.toString()} />
        <meta property="og:image:height" content={metadata.openGraph.images[0].height.toString()} />

        {/* Twitter card */}
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta name="twitter:description" content={metadata.twitter.description} />
        <meta name="twitter:image" content={metadata.twitter.images[0]} />
      </head>
      <body>
        {/* Navbar simple */}
        <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black/70 backdrop-blur-md fixed top-0 z-50">
          <Link href="/">
            <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text 
              bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 drop-shadow-lg 
              uppercase cursor-pointer select-none">Warzone Arena
            </h1>
          </Link>
          <div className="flex gap-6 uppercase text-sm">
            <Link href="/" className="hover:text-red-400 transition">Accueil</Link>
            <Link href="/tournaments" className="hover:text-red-400 transition">Tournois</Link>
            <Link href="/champions" className="hover:text-red-400 transition">Champions</Link>
          </div>
        </nav>

        {/* Contenu principal */}
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
