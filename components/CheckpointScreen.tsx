import React, { useState, useEffect } from 'react';
import { generateQuestions } from '../services/geminiService';
import { playSound } from '../services/audioService';
import { Question } from '../types';
import { Button } from './Button';
import confetti from 'canvas-confetti';

interface CheckpointScreenProps {
  checkpointName: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

const MAX_LIVES = 3;

interface FloatingText {
  id: number;
  val: number;
}

export const CheckpointScreen: React.FC<CheckpointScreenProps> = ({ checkpointName, onComplete, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userAns1, setUserAns1] = useState('');
  const [userAns2, setUserAns2] = useState('');
  
  // Game State
  const [lives, setLives] = useState(MAX_LIVES);
  const [checkpointScore, setCheckpointScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  // UI State
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [shake, setShake] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Animation State
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      const data = await generateQuestions(5);
      if (mounted) {
        setQuestions(data);
        setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#10b981']
    });
  };

  const handleCheck = () => {
    if (!questions[currentQIndex]) return;

    const q = questions[currentQIndex];
    const normUser1 = userAns1.toLowerCase().trim();
    const normUser2 = userAns2.toLowerCase().trim();
    const normAns1 = q.answer1.toLowerCase().trim();
    const normAns2 = q.answer2.toLowerCase().trim();

    const isCorrect = normUser1 === normAns1 && normUser2 === normAns2;

    setHasSubmitted(true);

    if (isCorrect) {
      playSound('correct');
      setFeedback('correct');
      const points = 100 + (combo * 20);
      setCheckpointScore(s => s + points);
      setCombo(c => c + 1);
      triggerConfetti();
      
      // Floating text animation
      const id = Date.now();
      setFloatingTexts(prev => [...prev, { id, val: points }]);
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
      }, 1000);

    } else {
      playSound('wrong');
      setFeedback('incorrect');
      setCombo(0);
      setShake(true);
      setTimeout(() => setShake(false), 500); // Reset shake class

      // Lose a life
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setIsGameOver(true);
      }
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setUserAns1('');
      setUserAns2('');
      setFeedback('none');
      setHasSubmitted(false);
    } else {
      onComplete(checkpointScore);
    }
  };

  const handleRetry = () => {
    // Reset state for this checkpoint
    setLives(MAX_LIVES);
    setCheckpointScore(0);
    setCombo(0);
    setCurrentQIndex(0);
    setUserAns1('');
    setUserAns2('');
    setFeedback('none');
    setHasSubmitted(false);
    setIsGameOver(false);
    setLoading(true);
    // Reload questions for variety
    generateQuestions(5).then(data => {
      setQuestions(data);
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF6E3] parchment-texture">
        <div className="animate-spin text-6xl mb-4">🧭</div>
        <p className="text-amber-900 text-xl font-bold animate-pulse font-serif">Deciphering Ancient Scripts...</p>
      </div>
    );
  }

  // Game Over Screen
  if (isGameOver) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900/90 fixed inset-0 z-50 p-6 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-4xl text-white font-bold mb-4 font-serif">Out of Hearts!</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-md">
                The ancient guardians have expelled you. But don't give up! 
                Study your conditionals and try again.
            </p>
            <div className="flex gap-4">
                <Button onClick={onBack} variant="secondary">Retreat</Button>
                <Button onClick={handleRetry} variant="primary">Try Again</Button>
            </div>
        </div>
     );
  }

  const currentQ = questions[currentQIndex];
  const progress = ((currentQIndex) / questions.length) * 100;

  return (
    <div className={`min-h-screen bg-[#FDF6E3] parchment-texture flex flex-col ${shake ? 'animate-shake' : ''} relative`}>
      {/* Floating Texts Layer */}
      {floatingTexts.map(ft => (
        <div 
          key={ft.id} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-float-up pointer-events-none"
        >
          <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            +{ft.val}
          </span>
        </div>
      ))}

      {/* Header */}
      <div className="bg-amber-900 text-amber-50 shadow-lg p-4 flex justify-between items-center sticky top-0 z-10 border-b-4 border-amber-700">
        <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={onBack} className="!bg-amber-800 !text-amber-100 hover:!bg-amber-700 border border-amber-600">
                Esc
            </Button>
            <div className="flex items-center space-x-1">
                {[...Array(MAX_LIVES)].map((_, i) => (
                    <span key={i} className={`text-2xl transition-all ${i < lives ? 'scale-100' : 'scale-0 grayscale opacity-0'}`}>
                        ❤️
                    </span>
                ))}
            </div>
        </div>
        
        <div className="flex flex-col items-center">
            <h2 className="font-bold text-amber-100 text-lg sm:text-xl font-serif">{checkpointName}</h2>
            {combo > 1 && <span className="text-xs text-yellow-300 font-bold animate-bounce">🔥 {combo}x COMBO!</span>}
        </div>

        <div className="font-mono text-amber-300 font-bold text-xl">
           {checkpointScore} pts
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-amber-900/20">
        <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 ease-out relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 -top-1 text-xs">⛵</div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-12 w-full border-4 border-double border-amber-200 relative">
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-amber-100 px-4 py-1 rounded-full border border-amber-300 text-amber-800 font-bold shadow-sm">
            Question {currentQIndex + 1} of {questions.length}
          </div>

          <h3 className="text-xl font-bold text-slate-500 mb-8 text-center uppercase tracking-widest text-xs">Fill in the blanks (Type 2 Conditional)</h3>
          
          <div className="text-lg sm:text-3xl leading-relaxed text-slate-800 font-medium text-center font-serif">
            <span>{currentQ.sentence_start}</span>
            <span className="inline-block mx-2">
                <input 
                  type="text" 
                  value={userAns1}
                  onChange={(e) => setUserAns1(e.target.value)}
                  disabled={hasSubmitted}
                  placeholder={currentQ.verb1_prompt}
                  autoComplete="off"
                  className={`border-b-4 text-center w-36 sm:w-48 px-2 py-1 focus:outline-none transition-all rounded-t-md font-sans
                    ${hasSubmitted 
                      ? (userAns1.toLowerCase().trim() === currentQ.answer1.toLowerCase().trim() ? 'border-emerald-500 bg-emerald-100 text-emerald-900' : 'border-red-500 bg-red-100 text-red-900')
                      : 'border-slate-300 focus:border-amber-500 bg-slate-50 focus:bg-amber-50 focus:scale-110'
                    }
                  `}
                />
                <div className="text-sm text-slate-400 mt-1 font-sans italic">{currentQ.verb1_prompt}</div>
            </span>
            <span>{currentQ.sentence_middle}</span>
            <span className="inline-block mx-2">
                <input 
                  type="text" 
                  value={userAns2}
                  onChange={(e) => setUserAns2(e.target.value)}
                  disabled={hasSubmitted}
                  placeholder={currentQ.verb2_prompt}
                  autoComplete="off"
                  className={`border-b-4 text-center w-36 sm:w-48 px-2 py-1 focus:outline-none transition-all rounded-t-md font-sans
                    ${hasSubmitted 
                      ? (userAns2.toLowerCase().trim() === currentQ.answer2.toLowerCase().trim() ? 'border-emerald-500 bg-emerald-100 text-emerald-900' : 'border-red-500 bg-red-100 text-red-900')
                      : 'border-slate-300 focus:border-amber-500 bg-slate-50 focus:bg-amber-50 focus:scale-110'
                    }
                  `}
                />
                <div className="text-sm text-slate-400 mt-1 font-sans italic">{currentQ.verb2_prompt}</div>
            </span>
            <span>{currentQ.sentence_end}</span>
          </div>

          {/* Feedback Section */}
          <div className={`mt-8 transition-all duration-500 ease-in-out overflow-hidden ${hasSubmitted ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className={`p-6 rounded-xl border-2 ${feedback === 'correct' ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
              <div className="flex items-center gap-4">
                 <div className={`text-4xl p-2 rounded-full ${feedback === 'correct' ? 'bg-emerald-200' : 'bg-red-200'}`}>
                    {feedback === 'correct' ? '🌟' : '💀'}
                 </div>
                 <div className="text-left">
                   <h4 className={`text-xl font-black ${feedback === 'correct' ? 'text-emerald-800' : 'text-red-800'}`}>
                     {feedback === 'correct' ? 'Excellent!' : 'Oh no!'}
                   </h4>
                   <p className="text-slate-700 mt-2 font-medium">{currentQ.explanation}</p>
                   {feedback === 'incorrect' && (
                     <div className="mt-2 p-2 bg-white/50 rounded border border-red-100 inline-block">
                       <p className="text-sm font-bold text-slate-500 uppercase">Correct Answer:</p>
                       <p className="text-lg font-serif text-slate-800">
                         {currentQ.answer1}, {currentQ.answer2}
                       </p>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-6 bg-white/80 border-t border-amber-200 flex justify-center sticky bottom-0 z-20 backdrop-blur">
        {!hasSubmitted ? (
          <Button onClick={handleCheck} disabled={!userAns1 || !userAns2} size="lg" className="w-full sm:w-1/2 shadow-amber-500/50 hover:-translate-y-1 transition-transform">
            🔮 Cast Answer
          </Button>
        ) : (
          <Button onClick={handleNext} variant="success" size="lg" className="w-full sm:w-1/2 shadow-emerald-500/50 hover:-translate-y-1 transition-transform">
            {currentQIndex < questions.length - 1 ? 'Next Challenge ➡️' : 'Claim Reward 🏆'}
          </Button>
        )}
      </div>
    </div>
  );
};