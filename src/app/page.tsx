"use client";

import React, { useState } from "react";
import { Eye, ShieldAlert, Heart, Trophy, BookOpen, Compass, CheckCircle2 } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import ExerciseTimer from "@/components/ExerciseTimer";
import ReflexGame from "@/components/ReflexGame";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"timer" | "game" | "tips">("timer");
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Simple local state to track completed stats for the session
  const [completedStats, setCompletedStats] = useState({
    exercisesCompleted: 0,
    gamesPlayed: 0,
    bestReflexMs: 9999,
  });

  const handleStartExercise = (exerciseId: string) => {
    setActiveExerciseId(exerciseId);
    setActiveTab("timer");
  };

  const handleStartGame = (gameId: string) => {
    setActiveGameId(gameId);
    setActiveTab("game");
  };

  const handleExerciseComplete = (exerciseId: string) => {
    setCompletedStats((prev) => ({
      ...prev,
      exercisesCompleted: prev.exercisesCompleted + 1,
    }));
  };

  const handleGameComplete = (gameId: string, avgReactionMs: number) => {
    setCompletedStats((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      bestReflexMs: Math.min(prev.bestReflexMs, avgReactionMs),
    }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="border-b border-sage-200/10 bg-white/40 dark:bg-sage-950/20 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-600 dark:bg-sage-500 flex items-center justify-center text-white shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-sage-900 dark:text-sage-100">
                Nain<span className="text-mint-500">Taara</span>
              </h1>
              <p className="text-[10px] text-sage-500 uppercase tracking-widest font-semibold">Eye Wellness Companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-xs text-sage-500 dark:text-sage-400 bg-sage-100 dark:bg-sage-900 px-3 py-1 rounded-full font-medium">
              💡 Remember to blink!
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: AI Assistant Chat (5 cols) */}
        <section className="lg:col-span-5 h-[calc(100vh-180px)] min-h-[500px]">
          <ChatInterface 
            onStartExercise={handleStartExercise} 
            onStartGame={handleStartGame} 
          />
        </section>

        {/* Right Column: Dashboard & Interactive Exercises (7 cols) */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Wellness Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-4 rounded-2xl flex flex-col justify-between border border-sage-200/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage-400">Rest Breaks</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-2xl font-bold text-sage-800 dark:text-sage-200">
                  {completedStats.exercisesCompleted}
                </span>
                <span className="text-xs text-sage-400 font-medium">done</span>
              </div>
            </div>

            <div className="glass p-4 rounded-2xl flex flex-col justify-between border border-sage-200/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage-400">Reflex Games</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-2xl font-bold text-sage-800 dark:text-sage-200">
                  {completedStats.gamesPlayed}
                </span>
                <span className="text-xs text-sage-400 font-medium">played</span>
              </div>
            </div>

            <div className="glass p-4 rounded-2xl flex flex-col justify-between border border-sage-200/10 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage-400">Best Speed</span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-2xl font-bold text-sage-800 dark:text-sage-200">
                  {completedStats.bestReflexMs === 9999 ? "—" : `${completedStats.bestReflexMs}`}
                </span>
                {completedStats.bestReflexMs !== 9999 && (
                  <span className="text-xs text-sage-400 font-medium">ms</span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Workspace Panel */}
          <div className="flex-1 flex flex-col min-h-[480px]">
            {/* Tabs Selector */}
            <div className="flex space-x-1 p-1 rounded-xl bg-sage-100/60 dark:bg-sage-950/40 border border-sage-200/5 mb-4">
              <button
                onClick={() => setActiveTab("timer")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === "timer"
                    ? "bg-white dark:bg-sage-900 text-sage-800 dark:text-sage-200 shadow-xs"
                    : "text-sage-500 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Relaxation Timer</span>
              </button>

              <button
                onClick={() => setActiveTab("game")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === "game"
                    ? "bg-white dark:bg-sage-900 text-sage-800 dark:text-sage-200 shadow-xs"
                    : "text-sage-500 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Reflex Game</span>
              </button>

              <button
                onClick={() => setActiveTab("tips")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === "tips"
                    ? "bg-white dark:bg-sage-900 text-sage-800 dark:text-sage-200 shadow-xs"
                    : "text-sage-500 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ergonomics & Guide</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1">
              {activeTab === "timer" && (
                <ExerciseTimer 
                  activeExerciseId={activeExerciseId} 
                  onComplete={handleExerciseComplete} 
                />
              )}

              {activeTab === "game" && (
                <ReflexGame 
                  activeGameId={activeGameId} 
                  onComplete={handleGameComplete} 
                />
              )}

              {activeTab === "tips" && (
                <div className="glass p-6 rounded-2xl border border-sage-200/20 shadow-lg space-y-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-sage-900 dark:text-sage-100 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-sage-500" />
                      Ergonomics & Eye Health Tips
                    </h3>
                    <p className="text-xs text-sage-500 dark:text-sage-400 mt-1 leading-relaxed">
                      Maintaining correct posture and ambient settings drastically reduces strain.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-xl bg-white/40 dark:bg-sage-950/20 border border-sage-200/10 space-y-1">
                        <h4 className="text-xs font-semibold text-sage-800 dark:text-sage-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-mint-500 shrink-0" />
                          The Arm's Length Rule
                        </h4>
                        <p className="text-[11px] text-sage-500 dark:text-sage-400 leading-relaxed">
                          Position your monitor about 20–30 inches away from your face (roughly arm's length).
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/40 dark:bg-sage-950/20 border border-sage-200/10 space-y-1">
                        <h4 className="text-xs font-semibold text-sage-800 dark:text-sage-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-mint-500 shrink-0" />
                          Screen Height Level
                        </h4>
                        <p className="text-[11px] text-sage-500 dark:text-sage-400 leading-relaxed">
                          The top of your screen should be at or slightly below eye level, looking slightly down.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/40 dark:bg-sage-950/20 border border-sage-200/10 space-y-1">
                        <h4 className="text-xs font-semibold text-sage-800 dark:text-sage-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-mint-500 shrink-0" />
                          Optimize Room Light
                        </h4>
                        <p className="text-[11px] text-sage-500 dark:text-sage-400 leading-relaxed">
                          Avoid glare from windows. Match the brightness of your screen to the surrounding room.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/40 dark:bg-sage-950/20 border border-sage-200/10 space-y-1">
                        <h4 className="text-xs font-semibold text-sage-800 dark:text-sage-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-mint-500 shrink-0" />
                          Control Humidity
                        </h4>
                        <p className="text-[11px] text-sage-500 dark:text-sage-400 leading-relaxed">
                          Dry office air reduces blinking lubrication. Sip water frequently and consider a humidifier.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start space-x-3 mt-4">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Important Health Reminder</h4>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                        NainTaara is an assistant for everyday wellness breaks, not a clinical treatment system. If you suffer from constant headaches, double vision, or sharp pain, please consult a clinical ophthalmologist.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-sage-200/10 py-6 mt-12 bg-white/10 dark:bg-sage-950/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-sage-400">
          <p>© 2026 NainTaara Companion. Formulated for mindful screen work habits. 🌿</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="https://www.practo.com/consult" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 font-semibold text-sage-600 dark:text-mint-400">
              Consult a Specialist ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
