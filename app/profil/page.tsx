"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

type Tournament = {
  id: string;
  name: string;
  date: string;
};

type UserProfile = {
  id: string;
  pseudo: string;
  email: string;
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      // Récupérer le pseudo
      const { data: profileData } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("id", user.id)
        .single();

      setProfile({
        id: user.id,
        pseudo: profileData?.pseudo ?? "Utilisateur",
        email: user.email ?? "",
      });

      // Récupérer les tournois auxquels l'utilisateur est inscrit
      const { data: userTournaments } = await supabase
        .from("participants")
        .select("tournament_id, tournaments(id, name, date)")
        .eq("user_id", user.id);

      const formatted = userTournaments?.map((t: any) => t.tournaments) ?? [];
      setTournaments(formatted);
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("participants").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.admin.deleteUser(user.id);

    alert("Votre compte a été supprimé.");
    router.push("/");
  };

  // 🔹 Fonction pour se désinscrire d'un tournoi
  const handleUnregister = async (tournamentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("user_id", user.id)
      .eq("tournament_id", tournamentId);

    if (error) {
      console.error(error);
      alert("Erreur lors de la désinscription.");
    } else {
      // Retirer le tournoi de la liste affichée
      setTournaments(tournaments.filter(t => t.id !== tournamentId));
      alert("Vous avez été désinscrit du tournoi.");
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-red-500 mb-6">Mon Profil</h1>

      {profile && (
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
          <p className="text-lg"><strong>Pseudo :</strong> {profile.pseudo}</p>
          <p className="text-sm text-gray-400 mt-2"><strong>Email :</strong> {profile.email}</p>

          <button
            onClick={handleLogout}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg transition"
          >
            Se déconnecter
          </button>

          <button
            onClick={handleDeleteAccount}
            className="mt-4 text-sm text-gray-400 hover:text-red-400 transition"
          >
            Supprimer mon compte
          </button>
        </div>
      )}

      {/* Liste des tournois */}
      <div className="mt-10 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Tournois auxquels je suis inscrit :
        </h2>

        {tournaments.length > 0 ? (
          <ul className="space-y-3">
            {tournaments.map((t) => (
              <li key={t.id} className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition flex justify-between items-center">
                <Link href={`/tournaments/${t.id}`} className="text-gray-200 font-bold">
                  {t.name} - {new Date(t.date).toLocaleDateString()}
                </Link>
                <button
                  onClick={() => handleUnregister(t.id)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm"
                >
                  Se désinscrire
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center">Vous n’êtes inscrit à aucun tournoi.</p>
        )}
      </div>
    </div>
  );
}
