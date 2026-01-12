import React, { useState, useEffect } from 'react';
import { QUESTIONS, SHEETS_ENDPOINT } from '../constants';
import { GameResult, Question } from '../types';

// Algoritmo de Fisher-Yates para embaralhar
const shuffleArray = (array: Question[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};


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

const Game: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameResult[]>([]);
  const hasSheetsEndpoint = Boolean(SHEETS_ENDPOINT && !SHEETS_ENDPOINT.includes('REPLACE'));

  // Carrega o ranking ao montar
  useEffect(() => {
    loadLeaderboard();
    if (!hasSheetsEndpoint) return;
    const interval = setInterval(() => {
      loadLeaderboard();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Embaralha as perguntas sempre que o jogo inicia ou reinicia
  const startGame = () => {
    if (playerName.trim()) {
      setGameQuestions(shuffleArray(QUESTIONS));
      setCurrentQuestionIndex(0);
      setScore(0);
      setGameOver(false);
      setShowIntroModal(false);
      setFeedback(null);
      updateRanking(0);
    }
  };

  const restartGame = () => {
    setPlayerName(''); // Opcional: manter ou limpar o nome
    setShowIntroModal(true);
    setGameOver(false);
    loadLeaderboard(); // Atualiza ranking ao reiniciar
  };

  const loadLeaderboard = async () => {
    if (hasSheetsEndpoint) {
      try {
        const data = await loadJsonp<{ ranking: GameResult[] }>(`${SHEETS_ENDPOINT}?type=ranking`);
        const parsed: GameResult[] = (data.ranking || []).map((entry: GameResult) => ({
          player: entry.player,
          score: entry.score,
          timestamp: entry.timestamp
        }));
        parsed.sort((a, b) => b.score - a.score);
        setLeaderboard(parsed.slice(0, 10));
        return;
      } catch (error) {
        // Fall back to local storage when remote fails
      }
    }

    const existing = localStorage.getItem('gameLeaderboard');
    if (existing) {
      const parsed: GameResult[] = JSON.parse(existing);
      parsed.sort((a, b) => b.score - a.score);
      setLeaderboard(parsed.slice(0, 10));
    }
  };

  const saveScoreLocal = (result: GameResult) => {
    const existing = localStorage.getItem('gameLeaderboard');
    const currentList: GameResult[] = existing ? JSON.parse(existing) : [];
    const existingIndex = currentList.findIndex(entry => entry.player === result.player);
    if (existingIndex >= 0) {
      currentList[existingIndex] = result;
    } else {
      currentList.push(result);
    }
    localStorage.setItem('gameLeaderboard', JSON.stringify(currentList));
  };

  const updateRanking = async (currentScore: number) => {
    if (!playerName.trim()) return;
    const result: GameResult = {
      player: playerName.trim(),
      score: currentScore,
      timestamp: Date.now()
    };

    saveScoreLocal(result);

    if (hasSheetsEndpoint) {
      try {
        await fetch(SHEETS_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ type: 'ranking', ...result })
        });
      } catch (error) {
        // Keep local fallback when remote fails
      }
    }

    loadLeaderboard();
  };

  const handleAnswer = (isTruth: boolean) => {
    const question = gameQuestions[currentQuestionIndex];
    const isCorrect = question.isTruth === isTruth;
    const nextScore = score + (isCorrect ? 1 : 0);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    updateRanking(nextScore);

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < gameQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setGameOver(true);
      }
    }, 800);
  };

  // --- VIEWS ---

  const IntroView = () => (
    <div className="relative group w-full h-full min-h-[400px]">
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      <div className="relative px-7 py-10 bg-gray-900/80 backdrop-blur-xl rounded-xl leading-none flex flex-col items-center justify-center border border-white/10 shadow-2xl h-full">
        <h2 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500 mb-6 text-center animate-pulse drop-shadow-lg">
          VERDADE OU FAKE?
        </h2>
        <p className="text-gray-300 text-center mb-8 font-mono text-lg max-w-md">
          Prove que você conhece o Rafael de verdade.
          <br />
          <span className="text-yellow-400 font-bold block mt-6 text-lg border border-yellow-400/30 p-2 rounded bg-yellow-400/10">
            🏆 O Vencedor Ganha um presente misterioso 🏆
          </span>
        </p>
        
        <input
          type="text"
          placeholder="Digite seu nome..."
          className="w-full max-w-xs bg-black/60 border border-purple-500/50 rounded-lg p-4 text-white mb-6 focus:ring-2 focus:ring-purple-400 focus:outline-none text-center placeholder-gray-500 backdrop-blur-sm shadow-inner"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />

        <button
          onClick={startGame}
          disabled={!playerName}
          className="w-full max-w-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.6)] transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest"
        >
          INICIAR JOGO
        </button>
      </div>
    </div>
  );

  const GameOverView = () => (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-xl shadow-[0_0_50px_rgba(34,197,94,0.2)] text-center w-full h-full flex flex-col justify-center items-center">
      <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-emerald-600 mb-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
        GAME OVER
      </h2>
      <div className="mb-8">
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Sua Pontuação Final</p>
        <p className="text-6xl font-mono font-bold text-yellow-400 drop-shadow-lg">
          {score}<span className="text-2xl text-gray-500">/{gameQuestions.length}</span>
        </p>
      </div>
      <p className="text-gray-300 mb-8 italic">
        "Pontuação salva no banco de dados da nave mãe."
      </p>
      <button 
        onClick={restartGame}
        className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-cyan-400 font-bold transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
      >
        TENTAR NOVAMENTE
      </button>
    </div>
  );

  const ActiveGameView = () => {
    const question = gameQuestions[currentQuestionIndex];
    if (!question) return null;

    return (
      <div className={`
        relative bg-gray-900/60 backdrop-blur-xl border rounded-xl p-8 min-h-[500px] flex flex-col justify-between transition-all duration-300 w-full h-full
        ${feedback === 'correct' ? 'border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.2)] bg-green-900/20' : ''}
        ${feedback === 'wrong' ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] bg-red-900/20' : ''}
        ${!feedback ? 'border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]' : ''}
      `}>
        
        {/* HUD */}
        <div className="flex justify-between items-center text-xs md:text-sm font-mono text-cyan-400/80 mb-6 border-b border-white/5 pb-4">
          <span className="uppercase tracking-wider">Player: {playerName}</span>
          <span className="bg-black/50 px-3 py-1 rounded border border-white/10">SCORE: {score}</span>
          <span>Q: {currentQuestionIndex + 1} / {gameQuestions.length}</span>
        </div>

        {/* Question */}
        <div className="flex-grow flex items-center justify-center p-4">
          <h3 className="text-xl md:text-3xl font-bold text-white text-center leading-relaxed drop-shadow-md">
            "{question.text}"
          </h3>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <button
            onClick={() => handleAnswer(true)}
            disabled={feedback !== null}
            className={`
              py-6 rounded-xl font-black text-xl md:text-2xl transition-all transform hover:scale-[1.02] active:scale-95 backdrop-blur-md border border-white/10 shadow-lg group
              ${feedback === null ? 'bg-gradient-to-br from-green-600 to-emerald-800 hover:from-green-500 hover:to-emerald-700 text-white' : 'bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-50'}
            `}
          >
            <span className="block group-hover:animate-pulse">VERDADE</span>
          </button>
          <button
            onClick={() => handleAnswer(false)}
            disabled={feedback !== null}
            className={`
              py-6 rounded-xl font-black text-xl md:text-2xl transition-all transform hover:scale-[1.02] active:scale-95 backdrop-blur-md border border-white/10 shadow-lg group
              ${feedback === null ? 'bg-gradient-to-br from-red-600 to-rose-800 hover:from-red-500 hover:to-rose-700 text-white' : 'bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-50'}
            `}
          >
             <span className="block group-hover:animate-pulse">FAKE NEWS</span>
          </button>
        </div>
        
        {/* Feedback Overlay */}
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-xl z-50 animate-in fade-in duration-200">
             <div className="text-center transform animate-bounce">
               <h2 className={`text-6xl md:text-8xl font-black ${feedback === 'correct' ? 'text-green-500 drop-shadow-[0_0_25px_rgba(34,197,94,0.8)]' : 'text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]'}`}>
                 {feedback === 'correct' ? 'CORRETO!' : 'ERROU!'}
               </h2>
               <p className="text-white mt-4 font-mono text-xl">{feedback === 'correct' ? '+1 Ponto' : '0 Pontos'}</p>
             </div>
          </div>
        )}
      </div>
    );
  };

  const LeaderboardView = () => (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full min-h-[500px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col">
      <h3 className="text-xl font-bold text-cyan-400 mb-6 border-b border-cyan-500/30 pb-4 flex items-center tracking-widest uppercase">
        <span className="mr-3 text-2xl">🏆</span> Ranking
      </h3>
      
      <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-cyan-700/50 scrollbar-track-transparent">
        {leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
            <span className="text-4xl mb-2">∅</span>
            <p className="text-sm">Sem dados no sistema.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {leaderboard.map((entry, idx) => (
              <li key={idx} className={`
                flex justify-between items-center p-3 rounded-lg border transition-all hover:scale-[1.02]
                ${idx === 0 ? 'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 
                  idx === 1 ? 'bg-gray-400/20 border-gray-400/50' : 
                  idx === 2 ? 'bg-orange-700/20 border-orange-700/50' : 'bg-white/5 border-white/5'}
              `}>
                <div className="flex items-center gap-3">
                  <span className={`
                    w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold
                    ${idx === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' : 
                      idx === 1 ? 'bg-gray-400 text-black' : 
                      idx === 2 ? 'bg-orange-700 text-white' : 'bg-gray-800 text-gray-400'}
                  `}>
                    {idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white truncate max-w-[120px]">
                      {entry.player}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className={`font-mono font-bold text-lg ${idx === 0 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                  {entry.score}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto my-20 px-4 z-10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:h-[600px]">
        
        {/* Coluna do Jogo (Ocupa 2/3 em telas grandes) */}
        <div className="lg:col-span-2 h-full">
           {showIntroModal ? <IntroView /> : gameOver ? <GameOverView /> : <ActiveGameView />}
        </div>

        {/* Coluna do Ranking (Ocupa 1/3) */}
        <div className="lg:col-span-1 h-full">
          <LeaderboardView />
        </div>
        
      </div>
    </div>
  );
};

export default Game;
