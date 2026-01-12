import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 text-center z-10 overflow-hidden">
      
      {/* Glitch Effect Title */}
      <h1 className="text-4xl md:text-7xl font-bold mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(0,255,255,0.7)]">
        B-day RAFAEL 36th
      </h1>
      
      <div className="border border-white/10 bg-gray-900/30 backdrop-blur-xl p-6 md:p-10 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] max-w-2xl w-full relative group">
        
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-red-500" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-red-500" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-red-500" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-red-500" />

        <div className="space-y-6 font-mono text-cyan-50">
          <p className="text-xl md:text-2xl text-red-400 font-bold animate-pulse">
            🚨 Convite ultra exclusivo 🚨
          </p>
          
          <p className="leading-relaxed text-gray-200">
            Se esse link chegou até você através de mim... <br/>
            <span className="text-purple-400 font-bold">Considere-se um privilegiado por que eu te amo! S2</span>
          </p>

          <div className="py-4 border-y border-white/10 my-4">
            <p className="text-lg">
              <span className="text-cyan-400">📅 Dia 18/01 (Domingo)</span><br/>
              Vou comemorar meus <span className="text-purple-400 text-xl font-bold">36 aninhos</span> de puro sexy appeal e Juventude 😌🔥
            </p>
          </div>

          <p className="text-sm md:text-base italic text-gray-300">
            Será um Evento intimista, só pros mais chegados e para as pessoas que eu amo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left p-4 bg-white/5 rounded backdrop-blur-sm border border-white/5">
            <div>
              <p className="text-cyan-400 font-bold">🕐 TIME:</p>
              <p>A partir das 13h</p>
            </div>
            <div>
              <p className="text-cyan-400 font-bold">📍 MISSION:</p>
              <p>Estreia oficial do meu novo lar... aliás do condomínio novo porque meu lar só cabe eu e uma Xurupita! kkk</p>
            </div>
          </div>
          
          <div className="mt-4 p-2 border border-purple-500/30 rounded bg-purple-900/10">
            <p className="font-bold text-purple-300 mb-1">DATA UPLOAD:</p>
            <ul className="text-sm space-y-2 list-none text-gray-300">
               <li>👉 Cada um traz o que for beber</li>
               <li>👉 E uma pecinha de <span className="text-red-500 font-bold bg-white/10 px-1 rounded">Wagyu A5</span> 🥩 😌</li>
            </ul>
          </div>

          <p className="text-xs text-cyan-600 mt-6">
            SYSTEM_MSG: Sua presença é mais que importante... é "A Lot Of important..."!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
