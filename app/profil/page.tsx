"use client";

import { useEffect, useState } from "react";

type Tournament = {
  _id: string;
  name: string;
  description: string;
  date: string;
};

type User = {
  username: string;
  email: string;
};

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState<{ open: boolean; tournamentId?: string }>({ open: false });

  // Récupère le profil et les tournois
  const fetchProfil = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profil", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setTournaments(data.tournaments);
      } else {
        setMessage(data.error || "Erreur lors de la récupération du profil");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la récupération du profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfil();
  }, []);

  // Fonction pour se désinscrire d’un tournoi
  const handleUnregister = async () => {
    if (!showConfirm.tournamentId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/profil/unregister/${showConfirm.tournamentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTournaments(tournaments.filter(t => t._id !== showConfirm.tournamentId));
        setMessage("Vous avez été désinscrit du tournoi.");
      } else {
        setMessage(data.error || "Erreur lors de la désinscription");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la désinscription");
    } finally {
      setShowConfirm({ open: false });
    }
  };

  // Fonction pour supprimer le compte
  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible !");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/profil/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("token");
        alert("Votre compte a été supprimé.");
        window.location.href = "/";
      } else {
        alert(data.error || "Erreur lors de la suppression du compte");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du compte");
    }
  };

  if (loading) return <p className="text-center mt-20">Chargement...</p>;
  if (!user) return <p className="text-center mt-20">{message || "Utilisateur introuvable"}</p>;

  return (
    <div className="min-h-screen p-8 bg-black text-gray-100 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-red-500 mb-6">Profil de {user.username}</h1>
      <p className="text-gray-200 mb-4">Email : {user.email}</p>

      <h2 className="text-2xl font-bold text-red-500 mb-4">Mes tournois inscrits</h2>
      {message && <p className="text-red-400 mb-4">{message}</p>}

      {tournaments.length === 0 ? (
        <p className="text-gray-400">Vous n’êtes inscrit à aucun tournoi pour le moment.</p>
      ) : (
        <ul className="space-y-4 w-full max-w-3xl">
          {tournaments.map((t) => (
            <li
              key={t._id}
              className="bg-gray-900 p-4 rounded-xl shadow-md flex justify-between items-center"
            >
              <a href={`/tournaments/${t._id}`} className="flex-1 cursor-pointer">
                <p className="text-xl font-bold text-gray-200">{t.name}</p>
                <p className="text-gray-400 mt-1 line-clamp-3 overflow-hidden">{t.description}</p>
                <p className="text-gray-400 mt-1">Date : {new Date(t.date).toLocaleDateString()}</p>
              </a>
              <button
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded"
                onClick={() => setShowConfirm({ open: true, tournamentId: t._id })}
              >
                Se désinscrire
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* POP-UP DE CONFIRMATION */}
      {showConfirm.open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-80 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Confirmer la désinscription</h2>
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir vous désinscrire de ce tournoi ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleUnregister}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Oui
              </button>
              <button
                onClick={() => setShowConfirm({ open: false })}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lien discret pour supprimer le compte */}
      <div className="mt-8 text-center">
        <button
          onClick={handleDeleteAccount}
          className="text-gray-400 text-sm hover:text-red-500 transition-colors"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
