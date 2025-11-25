import React from 'react';
import { Checkpoint } from '../types';
import { playSound } from '../services/audioService';

interface MapScreenProps {
  checkpoints: Checkpoint[];
  onSelectCheckpoint: (id: number) => void;
  totalScore: number;
}

export const MapScreen: React.FC<MapScreenProps> = ({ checkpoints, onSelectCheckpoint, totalScore }) => {
  // Find the last completed or first unlocked checkpoint to place avatar
  const currentActiveIndex = checkpoints.reduce((acc, cp, idx) => {
    if (cp.isCompleted) return idx + 1; // Move to next if completed
    if (!cp.isLocked && idx > acc) return idx;
    return acc;
  }, 0);

  // Clamp index
  const safeAvatarIndex = Math.min(currentActiveIndex, checkpoints.length - 1);
  const avatarPos = checkpoints[safeAvatarIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#e8dac0] parchment-texture font-serif">
      {/* Top Bar */}
      <div className="p-4 bg-amber-900 text-amber-50 shadow-lg sticky top-0 z-30 flex justify-between items-center border-b-4 border-amber-700">
        <div>
          <h2 className="text-2xl font-bold tracking-wider">FKYC MAP</h2>
        </div>
        <div className="bg-black/30 px-4 py-2 rounded-lg border border-amber-600">
          <span className="text-amber-300 font-bold mr-2">💰 Score:</span>
          <span className="text-xl font-mono text-white">{totalScore}</span>
        </div>
      </div>

      <div className="flex-grow relative w-full h-full overflow-hidden p-6 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
        
        {/* Map Area */}
        <div className="relative w-full max-w-4xl mx-auto h-[600px] bg-amber-200/20 rounded-3xl border-4 border-dashed border-amber-800/30 p-4 shadow-inner mt-4">
          
          {/* Decorative Map Elements */}
          <div className="absolute top-10 right-20 opacity-20 text-6xl rotate-12">⛰️</div>
          <div className="absolute bottom-20 left-10 opacity-20 text-6xl -rotate-12">🌊</div>
          <div className="absolute top-1/2 left-1/4 opacity-10 text-8xl">🐙</div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d={`M ${checkpoints.map(cp => `${cp.x} ${cp.y}`).join(' L ')}`} 
              fill="none" 
              stroke="#8B4513" 
              strokeWidth="0.8" 
              strokeDasharray="1,1"
              strokeOpacity="0.6"
            />
             <path 
              d={`M ${checkpoints.slice(0, safeAvatarIndex + 1).map(cp => `${cp.x} ${cp.y}`).join(' L ')}`} 
              fill="none" 
              stroke="#d97706" 
              strokeWidth="1.5" 
              strokeLinecap="round"
            />
          </svg>
          
          {/* Checkpoints */}
           {checkpoints.map((cp, index) => {
             const isActive = !cp.isLocked && !cp.isCompleted;
             return (
             <div 
              key={cp.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-500`}
              style={{ left: `${cp.x}%`, top: `${cp.y}%` }}
             >
                {/* Avatar */}
                {index === safeAvatarIndex && !checkpoints[checkpoints.length-1].isCompleted && (
                  <div className="absolute -top-12 animate-bounce z-20 pointer-events-none drop-shadow-md">
                     <span className="text-4xl filter drop-shadow-lg">🤠</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!cp.isLocked && !cp.isCompleted) {
                      playSound('click');
                      onSelectCheckpoint(cp.id);
                    }
                  }}
                  disabled={cp.isLocked || cp.isCompleted}
                  className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center border-4 shadow-[0_8px_0_rgba(0,0,0,0.2)] 
                    transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                    active:shadow-none active:translate-y-[4px] active:scale-95
                    ${cp.isCompleted 
                      ? 'bg-emerald-500 border-emerald-700 text-white cursor-default' 
                      : cp.isLocked 
                        ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed opacity-80' 
                        : 'bg-amber-500 border-amber-700 text-white animate-pulse hover:bg-amber-400 cursor-pointer hover:scale-110 hover:-rotate-3'
                    }
                  `}
                >
                  {cp.isCompleted ? (
                    <span className="text-3xl">🚩</span>
                  ) : cp.isLocked ? (
                    <span className="text-2xl">🔒</span>
                  ) : (
                    <span className="text-3xl font-black">{index + 1}</span>
                  )}
                </button>
                
                <div className={`mt-4 px-4 py-2 rounded-lg border-2 shadow-lg text-sm font-bold whitespace-nowrap backdrop-blur-sm
                  ${cp.isLocked 
                    ? 'bg-slate-100/80 border-slate-300 text-slate-500' 
                    : cp.isCompleted
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-white border-amber-300 text-amber-900 scale-110'
                  }
                `}>
                  {cp.name}
                </div>
             </div>
           )})}
        </div>
      </div>
    </div>
  );
};