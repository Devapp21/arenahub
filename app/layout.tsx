// app/layout.tsx
"use client"; // ✅ Ajoute ceci tout en haut

import "./globals.css";
import { Black_Ops_One } from "next/font/google";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const blackOps = Black_Ops_One({ subsets: ["latin"], weight: "400", variable: "--font-blackops" });

// ✅ Metadata pour favicon + OG
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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ pseudo: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ pseudo: payload.pseudo, email: payload.email });
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  return (
    <html lang="fr" className={`${blackOps.variable} bg-black text-white`}>
      <body>
        {/* Navbar */}
        <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black/70 backdrop-blur-md fixed top-0 z-50">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text 
            bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 drop-shadow-lg uppercase cursor-pointer select-none">
              Warzone Arena
            </h1>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-8 text-sm uppercase">
            <Link href="/" className="hover:text-red-400 transition">Accueil</Link>
            <Link href="/tournaments" className="hover:text-red-400 transition">Tournois</Link>
            <Link href="/champions" className="hover:text-red-400 transition">Champions</Link>
            {!user ? (
              <>
                <Link href="/login" className="hover:text-red-400 transition">Connexion</Link>
                <Link href="/register" className="hover:text-red-400 transition">Inscription</Link>
              </>
            ) : (
              <>
                <Link href="/profil" className="hover:text-red-400 transition">Profil</Link>
                <button onClick={handleLogout} className="hover:text-red-400 transition">Déconnexion</button>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-md flex flex-col items-center py-4 space-y-4 md:hidden">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
              <Link href="/tournaments" onClick={() => setMobileMenuOpen(false)}>Tournois</Link>
              <Link href="/champions" onClick={() => setMobileMenuOpen(false)}>Champions</Link>
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Inscription</Link>
                </>
              ) : (
                <>
                  <Link href="/profil" onClick={() => setMobileMenuOpen(false)}>Profil</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Déconnexion</button>
                </>
              )}
            </div>
          )}
        </nav>

        {/* Page content */}
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
