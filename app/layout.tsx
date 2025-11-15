// app/layout.tsx
import "./globals.css";
import { Black_Ops_One } from "next/font/google";
import RootLayoutClient from "./RootLayoutClient";

const blackOps = Black_Ops_One({ subsets: ["latin"], weight: "400", variable: "--font-blackops" });

// ✅ --- META / FAVICON / OPEN GRAPH ---
export const metadata = {
  title: "ArenaHub - Tournois Warzone",
  description: "Participez à nos tournois Warzone chaque semaine !",
  icons: {
    icon: "/favicon.ico", // <-- ton favicon
  },
  openGraph: {
    title: "ArenaHub - Tournois Warzone",
    description: "Participez à nos tournois Warzone chaque semaine !",
    images: ["/og-image.png"], // <-- image 1200x630 px
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${blackOps.variable} bg-black text-gray-100`}>
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
