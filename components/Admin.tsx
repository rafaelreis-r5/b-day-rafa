import React, { useState, useEffect } from 'react';
import { Convidado, GameResult } from '../types';
import { SHEETS_ENDPOINT } from '../constants';

interface AdminProps {
  onLogout: () => void;
}


const loadJsonp = <T,>(url: string, timeoutMs = 8000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_cb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement('script');
    const cleanup = () => {
      delete (window as any)[callbackName];
      script.remove();
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, timeoutMs);

    (window as any)[callbackName] = (data: T) => {
      window.clearTimeout(timeout);
      cleanup();
      resolve(data);
    };

    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    script.onerror = () => {
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error('JSONP error'));
    };
    document.body.appendChild(script);
  });
};

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [scores, setScores] = useState<GameResult[]>([]);
  const [activeTab, setActiveTab] = useState<'convidados' | 'ranking'>('convidados');

  useEffect(() => {
    const loadConvidados = async () => {
      const hasSheetsEndpoint = SHEETS_ENDPOINT && !SHEETS_ENDPOINT.includes('REPLACE');

      if (hasSheetsEndpoint) {
        try {
          const data = await loadJsonp<{ convidados: Convidado[] }>(`${SHEETS_ENDPOINT}?type=convidados`);
          const parsedConvidados: Convidado[] = (data.convidados || []).map((convidado: Convidado, index: number) => ({
            id: convidado.id || `${convidado.timestamp || Date.now()}-${index}`,
            name: convidado.name,
            host: convidado.host,
            isHost: convidado.isHost,
            timestamp: convidado.timestamp
          }));
          setConvidados(parsedConvidados);
          return;
        } catch (error) {
          // Fall back to local storage when remote fails
        }
      }

      const storedConvidados = localStorage.getItem('convidadosList');
      if (storedConvidados) {
        setConvidados(JSON.parse(storedConvidados));
      }
    };

    loadConvidados();

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
            onClick={() => setActiveTab('convidados')}
            className={`px-6 py-2 rounded font-bold ${activeTab === 'convidados' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            LISTA DE CONVIDADOS ({convidados.length})
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-6 py-2 rounded font-bold ${activeTab === 'ranking' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            RANKING DO JOGO
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
          {activeTab === 'convidados' ? (
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
                  {convidados.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhum convidado registrado.</td></tr>
                  ) : (
                    convidados.map((convidado) => (
                      <tr key={convidado.id} className="hover:bg-gray-700 transition">
                        <td className="p-4 font-bold text-white">{convidado.name}</td>
                        <td className="p-4 text-gray-300">{convidado.host || '-'}</td>
                        <td className="p-4 text-gray-300">{convidado.isHost ? 'Host' : 'Convidado'}</td>
                        <td className="p-4 text-gray-500 text-sm">
                          {new Date(convidado.timestamp).toLocaleString('pt-BR')}
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
