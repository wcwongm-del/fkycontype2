import React, { useEffect } from 'react';
import { Button } from './Button';
import { playSound } from '../services/audioService';
import confetti from 'canvas-confetti';

interface VictoryScreenProps {
  onRestart: () => void;
  totalScore: number;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ onRestart, totalScore }) => {
  useEffect(() => {
    playSound('win');
    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#d97706', '#f59e0b', '#10b981', '#fbbf24']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#d97706', '#f59e0b', '#10b981', '#fbbf24']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      
      {/* Sunburst effect background */}
      <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow" style={{animationDuration: '20s'}}>
             <path d="M50 50 L50 0 L55 0 Z" fill="white" />
             <path d="M50 50 L60 0 L65 0 Z" fill="white" transform="rotate(20 50 50)" />
             <path d="M50 50 L60 0 L65 0 Z" fill="white" transform="rotate(40 50 50)" />
             <path d="M50 50 L60 0 L65 0 Z" fill="white" transform="rotate(60 50 50)" />
             <path d="M50 50 L60 0 L65 0 Z" fill="white" transform="rotate(80 50 50)" />
             <path d="M50 50 L60 0 L65 0 Z" fill="white" transform="rotate(100 50 50)" />
             {/* ... simplified sunburst */}
          </svg>
      </div>

      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-lg border-8 border-amber-300 transform animate-float z-10">
        <div className="text-8xl mb-6 filter drop-shadow-md">👑</div>
        <h1 className="text-5xl font-black text-amber-900 mb-2 font-serif">Legendary!</h1>
        <p className="text-xl text-amber-700 mb-6 font-bold uppercase tracking-wide">Treasure Secured</p>
        
        <div className="bg-slate-900 text-amber-300 p-6 rounded-2xl mb-8 border-4 border-amber-500 shadow-inner">
            <p className="text-sm uppercase tracking-widest text-slate-400 mb-1">Total Score</p>
            <p className="text-6xl font-mono font-bold">{totalScore}</p>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl mb-8 border border-amber-200 italic text-slate-600">
            "If you hadn't persevered, you wouldn't have become a Master of Conditionals!"
        </div>

        <Button onClick={onRestart} size="lg" className="w-full text-xl py-4 shadow-xl">
          Start New Quest 🔄
        </Button>
      </div>
    </div>
  );
};