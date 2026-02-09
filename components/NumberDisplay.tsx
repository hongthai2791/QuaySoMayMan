import React from 'react';

interface NumberDisplayProps {
  currentNumber: number | null;
  isSpinning: boolean;
}

export const NumberDisplay: React.FC<NumberDisplayProps> = ({ currentNumber, isSpinning }) => {
  return (
    <div className="relative flex justify-center items-center py-12 md:py-20">
       {/* Decorative rings */}
       <div className={`absolute w-64 h-64 md:w-96 md:h-96 border-4 border-white/20 rounded-full ${isSpinning ? 'animate-ping' : ''}`} />
       <div className="absolute w-56 h-56 md:w-80 md:h-80 border-2 border-white/10 rounded-full" />
       
       {/* Main Display Box */}
       <div className="glass-panel relative z-10 w-full max-w-sm md:max-w-2xl mx-auto rounded-3xl p-8 md:p-16 flex justify-center items-center min-h-[200px] md:min-h-[300px] transition-all duration-300 transform">
          <h1 className={`font-black text-8xl md:text-[12rem] text-white tracking-tighter tabular-nums leading-none filter drop-shadow-2xl transition-all duration-100 ${isSpinning ? 'blur-sm scale-110 opacity-90' : 'scale-100 opacity-100 text-shadow-glow'}`}>
            {currentNumber !== null ? currentNumber : '---'}
          </h1>
       </div>
    </div>
  );
};
