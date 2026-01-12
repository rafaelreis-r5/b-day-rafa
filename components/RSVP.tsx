import React, { useState } from 'react';
import { Guest } from '../types';
import { SHEETS_ENDPOINT } from '../constants';

const RSVP: React.FC = () => {
  const [name, setName] = useState('');
  const [companionsInput, setCompanionsInput] = useState('');
  const [companions, setCompanions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addCompanion = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setCompanions(prev => [...prev, trimmed]);
    setCompanionsInput('');
  };

  const removeCompanion = (index: number) => {
    setCompanions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.includes('REPLACE')) {
      setError('Sheets endpoint not configured.');
      return;
    }

    setSubmitting(true);
    setError('');

    const timestamp = Date.now();
    const baseRows = [
      { name: name.trim(), host: name.trim(), isHost: true, timestamp },
      ...companions.map(companion => ({
        name: companion,
        host: name.trim(),
        isHost: false,
        timestamp
      }))
    ];

    const guests: Guest[] = baseRows.map((row, index) => ({
      id: `${timestamp}-${index}`,
      ...row
    }));

    try {
      await fetch(SHEETS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ guests })
      });

      const existingData = localStorage.getItem('guestList');
      const storedGuests = existingData ? JSON.parse(existingData) : [];
      localStorage.setItem('guestList', JSON.stringify([...storedGuests, ...guests]));

      setSubmitted(true);
      setName('');
      setCompanions([]);
      setCompanionsInput('');
    } catch (err) {
      setError('Nao foi possivel salvar no Sheets. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center border border-green-500/50 bg-green-900/40 backdrop-blur-xl rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] my-10 animate-fade-in">
        <h3 className="text-2xl font-bold text-green-400 mb-2 font-mono">ACCESS GRANTED</h3>
        <p className="text-green-100 mb-4">Presença confirmada no mainframe.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="text-xs text-green-400 hover:text-green-200 underline tracking-widest uppercase"
        >
          Cadastrar outro agente?
        </button>
      </div>
    );
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-10 z-10 relative flex flex-col items-center">
      
      {/* Mensagem de Alerta Piscante - FORA do container */}
      <div className="mb-6 animate-pulse">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <span className="relative flex items-center bg-black px-8 py-3 rounded-full border border-red-500/50 text-red-100 font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75 -left-1 -top-1"></span>
            ⚠️ Confirme sua presença! ⚠️
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-purple-500/30 transition-colors duration-500">
        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-6 text-center uppercase tracking-widest border-b border-purple-500/30 pb-4 font-mono">
          Protocolo de Acesso
        </h2>
        
        <p className="text-gray-300 text-center mb-8 text-sm font-light tracking-wide">
          ⚠️ As Vagas São limitadas - Preencha a Lista de confirmação abaixo!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-cyan-400 text-xs font-bold mb-2 tracking-[0.2em] uppercase">
              Agent Identification (Seu Nome)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all font-mono placeholder-gray-600 backdrop-blur-sm"
              placeholder="Digite seu nome de código..."
              required
            />
          </div>

          <div>
            <label htmlFor="companions" className="block text-cyan-400 text-xs font-bold mb-2 tracking-[0.2em] uppercase">
              Companions (Quem vai com você?)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="companions"
                value={companionsInput}
                onChange={(e) => setCompanionsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCompanion(companionsInput);
                  }
                }}
                className="flex-1 bg-black/50 border border-gray-700 rounded p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all font-mono placeholder-gray-600 backdrop-blur-sm"
                placeholder="Digite um convidado e aperte Enter..."
              />
              <button
                type="button"
                onClick={() => addCompanion(companionsInput)}
                className="px-4 bg-white/10 border border-white/10 rounded text-xs uppercase tracking-widest text-cyan-300 hover:text-white hover:border-cyan-400/50 transition"
              >
                Add
              </button>
            </div>

            {companions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {companions.map((companion, index) => (
                  <span
                    key={`${companion}-${index}`}
                    className="flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-200"
                  >
                    {companion}
                    <button
                      type="button"
                      onClick={() => removeCompanion(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-purple-700/80 to-blue-700/80 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded border border-white/10 uppercase tracking-[0.25em] transform hover:translate-y-[-2px] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all duration-300 backdrop-blur-md mt-4"
          >
            {submitting ? 'Salvando...' : 'Salvar Presenca'}
          </button>
          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
        </form>
      </div>
    </section>
  );
};

export default RSVP;
