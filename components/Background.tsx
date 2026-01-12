import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black pointer-events-none">
      {/* 
        IMAGEM REAL DO UNIVERSO 
        Z-Index ajustado para 0 para não ficar atrás do body do HTML.
        O conteúdo do App tem z-index-10, então ficará por cima.
      */}
      <img 
        src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop" 
        alt="Background Space" 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
    </div>
  );
};

export default Background;