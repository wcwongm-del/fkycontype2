import React from 'react';
import { Button } from './Button';
import { playSound } from '../services/audioService';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const handleStart = () => {
    playSound('start');
    onStart();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#FDF6E3] relative overflow-hidden parchment-texture">
      
      {/* Decorative Circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="z-10 max-w-2xl w-full bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-2xl border-4 border-amber-800/20 transform transition-all hover:scale-[1.01]">
        
        <div className="mb-8 relative inline-block">
          <span className="text-8xl animate-bounce inline-block filter drop-shadow-lg">🗺️</span>
          <span className="absolute -bottom-2 -right-4 text-6xl animate-pulse">✨</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 mb-2 tracking-tight">
          FKYC
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-amber-800 mb-8 font-serif">
          The Lost Grammar Treasure
        </h2>

        <div className="bg-amber-100/50 p-6 rounded-xl border-2 border-dashed border-amber-300 mb-8 mx-auto max-w-lg">
          <p className="text-lg text-slate-800 font-medium leading-relaxed">
            Ahoy, Student! 🏴‍☠️ <br/>
            Travel across the lands, master the <strong>Conditional Type 2</strong>, and collect the ancient gold. 
            <br/><br/>
            <span className="text-sm text-slate-600 italic">"If you were brave enough, you would start the game..."</span>
          </p>
        </div>
        
        <Button onClick={handleStart} size="lg" className="w-full sm:w-auto px-12 py-4 text-xl shadow-orange-500/20">
          Begin Adventure 🚀
        </Button>
      </div>
    </div>
  );
};