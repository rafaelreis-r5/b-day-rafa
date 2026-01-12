import React, { useState, useEffect } from 'react';
import { Guest, GameResult } from '../types';
import { SHEETS_ENDPOINT } from '../constants';

interface AdminProps {
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [scores, setScores] = useState<GameResult[]>([]);
  const [activeTab, setActiveTab] = useState<'guests' | 'ranking'>('guests');

  useEffect(() => {
    const loadGuests = async () => {
      const hasSheetsEndpoint = SHEETS_ENDPOINT && !SHEETS_ENDPOINT.includes('REPLACE');

      if (hasSheetsEndpoint) {
        try {
          const response = await fetch(SHEETS_ENDPOINT);
          if (!response.ok) {
            throw new Error('Failed to load guests.');
          }
          const data = await response.json();
          const parsedGuests: Guest[] = (data.guests || []).map((guest: Guest, index: number) => ({
            id: guest.id || `${guest.timestamp || Date.now()}-${index}`,
            name: guest.name,
            host: guest.host,
            isHost: guest.isHost,
            timestamp: guest.timestamp
          }));
          setGuests(parsedGuests);
          return;
        } catch (error) {
          // Fall back to local storage when remote fails
        }
      }

      const storedGuests = localStorage.getItem('guestList');
      if (storedGuests) {
        setGuests(JSON.parse(storedGuests));
      }
    };

    loadGuests();

    const storedScores = localStorage.getItem('gameLeaderboard');
    if (storedScores) {
      const parsedScores: GameResult[] = JSON.parse(storedScores);
      // Sort by score descending
      parsedScores.sort((a, b) => b.score - a.score);
      setScores(parsedScores);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-cyan-400">SYSTEM ADMIN // DASHBOARD</h1>
          <button 
            onClick={onLogout}
            className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded transition"
          >
            LOGOUT
          </button>
        </header>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-6 py-2 rounded font-bold ${activeTab === 'guests' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            LISTA DE CONVIDADOS ({guests.length})
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-6 py-2 rounded font-bold ${activeTab === 'ranking' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            RANKING DO JOGO
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
          {activeTab === 'guests' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-gray-400 uppercase text-xs">
                    <th className="p-4 border-b border-gray-700">Nome</th>
                    <th className="p-4 border-b border-gray-700">Grupo</th>
                    <th className="p-4 border-b border-gray-700">Tipo</th>
                    <th className="p-4 border-b border-gray-700">Data Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {guests.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhum convidado registrado.</td></tr>
                  ) : (
                    guests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-700 transition">
                        <td className="p-4 font-bold text-white">{guest.name}</td>
                        <td className="p-4 text-gray-300">{guest.host || '-'}</td>
                        <td className="p-4 text-gray-300">{guest.isHost ? 'Host' : 'Convidado'}</td>
                        <td className="p-4 text-gray-500 text-sm">
                          {new Date(guest.timestamp).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-gray-400 uppercase text-xs">
                    <th className="p-4 border-b border-gray-700">Rank</th>
                    <th className="p-4 border-b border-gray-700">Player</th>
                    <th className="p-4 border-b border-gray-700 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {scores.length === 0 ? (
                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">Nenhum jogo registrado.</td></tr>
                  ) : (
                    scores.map((score, index) => (
                      <tr key={score.timestamp} className="hover:bg-gray-700 transition">
                        <td className="p-4 font-bold text-cyan-400">#{index + 1}</td>
                        <td className="p-4 text-white">{score.player}</td>
                        <td className="p-4 text-right font-mono text-yellow-400 font-bold">{score.score}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
