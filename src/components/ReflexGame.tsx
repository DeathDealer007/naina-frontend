"use client";

import React, { useState, useEffect, useRef } from "react";
import { Zap, Play, RotateCcw, Trophy, Award } from "lucide-react";

interface ReflexGameProps {
  activeGameId: string | null;
  onComplete: (gameId: string, avgReactionMs: number) => void;
}

interface Target {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number; // pixels
  color: string;
  spawnTime: number;
}

const GAME_CONFIGS = {
  game_tracker: {
    title: "Eye Tracker",
    description: "Follow the glowing stars. Relieve visual tunnel-vision and stimulate peripheral visual reflexes.",
    targetCount: 10,
    maxSize: 48,
    minSize: 32,
  },
  game_reflex: {
    title: "Reflex Runner",
    description: "Click the disappearing elements. Boost response times and wake up your short-term concentration.",
    targetCount: 12,
    maxSize: 40,
    minSize: 24,
  }
};

export default function ReflexGame({ activeGameId, onComplete }: ReflexGameProps) {
  const selectedId = activeGameId && GAME_CONFIGS[activeGameId as keyof typeof GAME_CONFIGS] ? activeGameId : "game_tracker";
  const config = GAME_CONFIGS[selectedId as keyof typeof GAME_CONFIGS];

  const [gameState, setGameState] = useState<"idle" | "countdown" | "playing" | "finished">("idle");
  const [countdown, setCountdown] = useState(3);
  const [hits, setHits] = useState(0);
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);
  const [reactions, setReactions] = useState<number[]>([]);
  const [avgReaction, setAvgReaction] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync game configurations
  useEffect(() => {
    resetGame();
  }, [activeGameId]);

  const startGame = () => {
    setGameState("countdown");
    setCountdown(3);
    setHits(0);
    setReactions([]);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          setGameState("playing");
          spawnNextTarget();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const spawnNextTarget = (currentHitsCount = 0) => {
    if (currentHitsCount >= config.targetCount) {
      finishGame();
      return;
    }

    const size = Math.floor(Math.random() * (config.maxSize - config.minSize + 1)) + config.minSize;
    // Keep targets away from edges (10% to 90%)
    const x = Math.floor(Math.random() * 80) + 10;
    const y = Math.floor(Math.random() * 80) + 10;
    
    // Soothing natural colors
    const colors = [
      "#7fbc9e", // mint
      "#5e8268", // sage
      "#7b9e84", // soft green
      "#98d7b5", // light mint
      "#e6d8c4", // warm cream
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    setCurrentTarget({
      id: Math.random(),
      x,
      y,
      size,
      color,
      spawnTime: performance.now(),
    });
  };

  const handleTargetClick = () => {
    if (!currentTarget) return;
    
    const clickTime = performance.now();
    const reactionTime = clickTime - currentTarget.spawnTime;
    
    // Play target click sound (Synthesizer Beep)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600 + hits * 50, audioCtx.currentTime); // Pitch increases per hit
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}

    const newReactions = [...reactions, reactionTime];
    setReactions(newReactions);
    
    const nextHits = hits + 1;
    setHits(nextHits);
    
    spawnNextTarget(nextHits);
  };

  const finishGame = () => {
    setGameState("finished");
    setCurrentTarget(null);
    
    if (reactions.length > 0) {
      const sum = reactions.reduce((a, b) => a + b, 0);
      const avg = Math.round(sum / reactions.length);
      setAvgReaction(avg);
      onComplete(selectedId, avg);
    }
  };

  const resetGame = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setGameState("idle");
    setHits(0);
    setCurrentTarget(null);
    setReactions([]);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl glass p-6 border border-sage-200/20 shadow-lg justify-between relative overflow-hidden min-h-[360px]">
      
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sage-100 dark:bg-sage-900 text-sage-600 dark:text-sage-400">
          Reflex Exercise
        </span>
        <h3 className="font-semibold text-lg text-sage-900 dark:text-sage-100 mt-1">{config.title}</h3>
        <p className="text-xs text-sage-500 dark:text-sage-400 mt-1 leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Game Field Container */}
      <div 
        ref={containerRef}
        className="flex-1 my-4 border border-sage-200/10 rounded-xl relative overflow-hidden bg-sage-50/20 dark:bg-sage-950/20 min-h-[200px] flex items-center justify-center"
      >
        {gameState === "idle" && (
          <div className="text-center p-4">
            <div className="w-14 h-14 rounded-full bg-sage-100 dark:bg-sage-900 flex items-center justify-center text-sage-600 dark:text-sage-400 mx-auto mb-3 shadow-inner">
              <Zap className="w-6 h-6" />
            </div>
            <button
              onClick={startGame}
              className="px-5 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-medium text-xs flex items-center justify-center space-x-1.5 mx-auto transition-all shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Start Reflex Reset</span>
            </button>
            <p className="text-[10px] text-sage-400 mt-2">Spawns {config.targetCount} targets to refresh your focus.</p>
          </div>
        )}

        {gameState === "countdown" && (
          <div className="text-center animate-scaleIn">
            <span className="text-6xl font-bold font-mono text-sage-600 dark:text-sage-400">
              {countdown}
            </span>
            <p className="text-xs text-sage-400 uppercase tracking-widest font-semibold mt-2">Get Ready</p>
          </div>
        )}

        {gameState === "playing" && currentTarget && (
          <button
            onClick={handleTargetClick}
            style={{
              left: `${currentTarget.x}%`,
              top: `${currentTarget.y}%`,
              width: `${currentTarget.size}px`,
              height: `${currentTarget.size}px`,
              backgroundColor: currentTarget.color,
              transform: "translate(-50%, -50%)",
            }}
            className="absolute rounded-full border border-white/40 shadow-md cursor-pointer animate-scaleIn hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
            title="Click target"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
          </button>
        )}

        {gameState === "finished" && (
          <div className="text-center p-6 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Award className="w-7 h-7" />
            </div>
            <h4 className="font-semibold text-sm text-sage-800 dark:text-sage-200">Reflex Exercise Complete!</h4>
            <p className="text-xs text-sage-500 dark:text-sage-400 mt-1">Excellent job giving your visual focus a quick reboot.</p>
            
            <div className="mt-4 inline-flex items-center space-x-6 bg-white dark:bg-sage-900 border border-sage-200/10 px-4 py-2.5 rounded-xl shadow-xs">
              <div className="text-left">
                <span className="text-[9px] font-bold text-sage-400 uppercase tracking-wider block">Hits</span>
                <span className="text-sm font-semibold text-sage-800 dark:text-sage-200">{hits} / {config.targetCount}</span>
              </div>
              <div className="w-px h-6 bg-sage-200/20"></div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-sage-400 uppercase tracking-wider block">Avg Speed</span>
                <span className="text-sm font-semibold text-sage-800 dark:text-sage-200">{avgReaction} ms</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="mt-6 px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-medium text-xs flex items-center justify-center space-x-1.5 mx-auto transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        )}

        {/* Live Score Hud */}
        {gameState === "playing" && (
          <div className="absolute top-3 left-3 right-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-sage-400 select-none">
            <span>Hits: {hits} / {config.targetCount}</span>
            {reactions.length > 0 && (
              <span>Last: {Math.round(reactions[reactions.length - 1])} ms</span>
            )}
          </div>
        )}
      </div>

      {/* preset selector footer */}
      <div className="flex space-x-2 border-t border-sage-200/10 pt-4">
        {Object.entries(GAME_CONFIGS).map(([id, game]) => (
          <button
            key={id}
            onClick={() => {
              if (gameState !== "playing" && gameState !== "countdown") {
                resetGame();
                // trigger redraw config
              }
            }}
            className={`flex-1 px-3 py-2 rounded-xl border text-xs font-semibold tracking-wide text-center transition-all truncate ${
              selectedId === id
                ? "bg-sage-500/10 border-sage-500/30 text-sage-800 dark:text-sage-200"
                : "bg-transparent border-sage-200/10 hover:bg-sage-100/40 dark:hover:bg-sage-900/40 text-sage-400 dark:text-sage-500 cursor-pointer"
            }`}
          >
            {game.title}
          </button>
        ))}
      </div>
    </div>
  );
}
