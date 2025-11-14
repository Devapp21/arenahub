// app/rules/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function RulesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold text-red-500 mb-6 text-center">Règles du tournoi</h1>

        <div className="text-gray-200 space-y-4">
          <p>1. Respectez les autres participants et le personnel du tournoi.</p>
          <p>2. Toute tricherie entraînera une disqualification immédiate.</p>
          <p>3. Les décisions des organisateurs sont finales.</p>
          <p>4. Vous devez respecter les horaires et le règlement du tournoi.</p>
          <p>5. Amusez-vous et profitez du tournoi !</p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-red-400 underline hover:text-red-500"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
}
