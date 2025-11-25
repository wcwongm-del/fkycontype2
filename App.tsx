import React, { useState } from 'react';
import { GameState, Checkpoint } from './types';
import { StartScreen } from './components/StartScreen';
import { MapScreen } from './components/MapScreen';
import { CheckpointScreen } from './components/CheckpointScreen';
import { VictoryScreen } from './components/VictoryScreen';

// Initial data for checkpoints
const INITIAL_CHECKPOINTS: Checkpoint[] = [
  { id: 1, name: "The Whispering Woods", description: "Start your journey here.", isLocked: false, isCompleted: false, x: 20, y: 80 },
  { id: 2, name: "The Grammar Gorge", description: "Watch your tenses!", isLocked: true, isCompleted: false, x: 50, y: 50 },
  { id: 3, name: "The Temple of Conditions", description: "The final test.", isLocked: true, isCompleted: false, x: 80, y: 20 },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(INITIAL_CHECKPOINTS);
  const [activeCheckpointId, setActiveCheckpointId] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  const handleStartGame = () => {
    setGameState(GameState.MAP);
  };

  const handleSelectCheckpoint = (id: number) => {
    setActiveCheckpointId(id);
    setGameState(GameState.CHECKPOINT);
  };

  const handleCompleteCheckpoint = (scoreEarned: number) => {
    if (activeCheckpointId === null) return;

    setTotalScore(prev => prev + scoreEarned);

    // Update checkpoints: Mark current as complete, unlock next
    setCheckpoints(prev => {
      const newCheckpoints = prev.map(cp => 
        cp.id === activeCheckpointId ? { ...cp, isCompleted: true } : cp
      );
      
      // Find the next checkpoint to unlock
      const currentIndex = newCheckpoints.findIndex(cp => cp.id === activeCheckpointId);
      if (currentIndex !== -1 && currentIndex < newCheckpoints.length - 1) {
        newCheckpoints[currentIndex + 1].isLocked = false;
      }

      return newCheckpoints;
    });

    // Check if all completed
    const isLastCheckpoint = activeCheckpointId === checkpoints[checkpoints.length - 1].id;
    
    if (isLastCheckpoint) {
      setGameState(GameState.VICTORY);
    } else {
      setGameState(GameState.MAP);
    }
    setActiveCheckpointId(null);
  };

  const handleExitCheckpoint = () => {
    setGameState(GameState.MAP);
    setActiveCheckpointId(null);
  };

  const handleRestart = () => {
    setCheckpoints(INITIAL_CHECKPOINTS);
    setGameState(GameState.START);
    setActiveCheckpointId(null);
    setTotalScore(0);
  };

  return (
    <div className="font-sans text-slate-900">
      {gameState === GameState.START && (
        <StartScreen onStart={handleStartGame} />
      )}

      {gameState === GameState.MAP && (
        <MapScreen 
          checkpoints={checkpoints} 
          onSelectCheckpoint={handleSelectCheckpoint}
          totalScore={totalScore} 
        />
      )}

      {gameState === GameState.CHECKPOINT && activeCheckpointId && (
        <CheckpointScreen
          checkpointName={checkpoints.find(c => c.id === activeCheckpointId)?.name || 'Unknown Location'}
          onComplete={handleCompleteCheckpoint}
          onBack={handleExitCheckpoint}
        />
      )}

      {gameState === GameState.VICTORY && (
        <VictoryScreen onRestart={handleRestart} totalScore={totalScore} />
      )}
    </div>
  );
};

export default App;