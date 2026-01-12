import React from 'react';
import { MAP_EMBED_URL } from '../constants';

const MapSection: React.FC = () => {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 z-10 relative flex flex-col items-center">
      
      {/* Word Art Style Reference */}
      <div className="mb-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
        <h2 className="text-3xl md:text-5xl font-black text-center" 
            style={{
              fontFamily: '"Impact", sans-serif', // Fallback
              background: 'linear-gradient(to bottom, #FF00FF, #00FFFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(4px 4px 0px #ffffff)',
              letterSpacing: '2px'
            }}>
          PERTO DO SUPER SHOPPING OSASCO
        </h2>
        <div className="w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mt-2 rounded-full blur-[2px]" />
      </div>

      <div className="w-full h-[400px] md:h-[500px] border border-white/10 p-2 bg-gray-900/30 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative group">
        
        {/* Tech corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/70 z-20 rounded-tl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/70 z-20 rounded-br-lg" />

        <iframe 
          src={MAP_EMBED_URL}
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.2)' }} 
          allowFullScreen={true} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-lg w-full h-full grayscale hover:grayscale-0 transition-all duration-700 opacity-80 hover:opacity-100"
        />

        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 border-l-4 border-red-500 text-white font-mono text-sm z-20 rounded-r">
          <p className="font-bold">Edifício Ultra Bela Vista</p>
          <p className="text-gray-400">Rua Alice Manholer Piteri, 122</p>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
