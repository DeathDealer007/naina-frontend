"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle, Clock, Check, Eye } from "lucide-react";

interface ExerciseConfig {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  breakSeconds?: number;
  steps: string[];
}

const EXERCISES: Record<string, ExerciseConfig> = {
  ex_20_20_20: {
    id: "ex_20_20_20",
    title: "The 20-20-20 Rule",
    description: "Relax your focusing muscles. Look at an object 20 feet away for 20 seconds every 20 minutes.",
    durationSeconds: 1200, // 20 minutes
    breakSeconds: 20,
    steps: [
      "Keep working comfortably. Sit back and maintain a good posture.",
      "Time for a break! Look away from your screen.",
      "Focus on an object 20 feet (6 meters) away.",
      "Blink slowly and let your ciliary muscles relax completely."
    ],
  },
  ex_palming: {
    id: "ex_palming",
    title: "Eye Palming",
    description: "Soothe your ocular nerves and block out light to let your retinas rest.",
    durationSeconds: 120, // 2 minutes
    steps: [
      "Rub your hands together vigorously until they feel warm.",
      "Gently cup your warm palms over your closed eyes (do not press).",
      "Rest your fingers on your forehead, heel of hand on cheekbones.",
      "Breathe deeply in the soothing darkness and relax."
    ]
  },
  ex_eye_rolling: {
    id: "ex_eye_rolling",
    title: "Ocular Muscle Stretch",
    description: "Stretch and strengthen your eye muscles to relieve physical tension.",
    durationSeconds: 60, // 1 minute
    steps: [
      "Sit upright. Look straight ahead, relax your shoulders.",
      "Slowly roll your eyes in a circle clockwise, repeating 5 times.",
      "Now roll your eyes counter-clockwise, repeating 5 times.",
      "Close your eyes, take a deep breath, and let them rest."
    ]
  },
  ex_focus_shift: {
    id: "ex_focus_shift",
    title: "Near-Far Focus Shifting",
    description: "Train your ciliary muscles to switch focus dynamically, improving focus agility.",
    durationSeconds: 90, // 1.5 minutes
    steps: [
      "Hold your thumb about 10 inches in front of your face. Focus on it.",
      "Slowly shift your focus to an object 10-15 feet away.",
      "Hold focus for 2 seconds, then shift back to your thumb.",
      "Repeat this focus shift rhythmically to exercise visual accommodation."
    ]
  }
};

interface ExerciseTimerProps {
  activeExerciseId: string | null;
  onComplete: (exerciseId: string) => void;
}

export default function ExerciseTimer({ activeExerciseId, onComplete }: ExerciseTimerProps) {
  const selectedId = activeExerciseId && EXERCISES[activeExerciseId] ? activeExerciseId : "ex_20_20_20";
  const exercise = EXERCISES[selectedId];

  const [timeLeft, setTimeLeft] = useState(exercise.durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakPhase, setIsBreakPhase] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [fastMode, setFastMode] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with active exercise from outside
  useEffect(() => {
    resetTimer(selectedId);
  }, [activeExerciseId]);

  // Adjust timers if Fast Mode is toggled
  const getDuration = (id: string, phase: "work" | "break"): number => {
    const config = EXERCISES[id];
    if (fastMode) {
      return phase === "work" ? 10 : 5; // 10s work, 5s break for developer testing
    }
    return phase === "work" ? config.durationSeconds : (config.breakSeconds || 20);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handlePhaseTransition();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isBreakPhase, fastMode]);

  // Rhythmically update step hints during work phase or breaks
  useEffect(() => {
    if (timeLeft > 0) {
      const stepCount = exercise.steps.length;
      const durationTotal = getDuration(selectedId, isBreakPhase ? "break" : "work");
      const progressFraction = (durationTotal - timeLeft) / durationTotal;
      const stepIndex = Math.min(
        Math.floor(progressFraction * stepCount),
        stepCount - 1
      );
      setCurrentStepIdx(stepIndex >= 0 ? stepIndex : 0);
    }
  }, [timeLeft, isBreakPhase]);

  const handlePhaseTransition = () => {
    // Sound chime (simple HTML5 Web Audio API Synth)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(isBreakPhase ? 440 : 587.33, audioCtx.currentTime); // A4 or D5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.log("Audio not supported or interaction needed:", e);
    }

    if (selectedId === "ex_20_20_20" && !isBreakPhase) {
      // Transition from work to break
      setIsBreakPhase(true);
      setTimeLeft(getDuration(selectedId, "break"));
      setIsRunning(true);
    } else {
      // Completed full exercise
      setIsRunning(false);
      setIsBreakPhase(false);
      onComplete(selectedId);
      resetTimer(selectedId);
    }
  };

  const resetTimer = (id = selectedId) => {
    setIsRunning(false);
    setIsBreakPhase(false);
    setTimeLeft(getDuration(id, "work"));
    setCurrentStepIdx(0);
  };

  const toggleStartPause = () => {
    setIsRunning(!isRunning);
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalDuration = getDuration(selectedId, isBreakPhase ? "break" : "work");
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="flex flex-col h-full rounded-2xl glass p-6 border border-sage-200/20 shadow-lg justify-between relative overflow-hidden">
      {/* Visual background ripple during break */}
      {isBreakPhase && isRunning && (
        <div className="absolute inset-0 bg-sage-900/90 dark:bg-sage-950/95 z-40 flex flex-col items-center justify-center text-center p-8 transition-all animate-fadeIn">
          {/* Pulsing visual for eyes */}
          <div className="w-28 h-28 rounded-full bg-mint-500/20 border-2 border-mint-400 flex items-center justify-center animate-ping duration-1000 mb-6">
            <Eye className="w-10 h-10 text-mint-300 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-mint-300">Look Away! 🌿</h3>
          <p className="text-sage-300 text-sm mt-3 max-w-sm">
            Focus on something at least 20 feet away. Let your ciliary muscles stretch.
          </p>
          <div className="text-5xl font-mono font-bold text-white mt-6">
            {formatTime(timeLeft)}
          </div>
          
          <div className="mt-8 space-y-2 max-w-xs text-xs text-sage-400 border-t border-sage-800 pt-4">
            <p className="font-semibold text-mint-400">Posture Check:</p>
            <p>Roll your shoulders, drop your neck forward, and blink slowly.</p>
          </div>

          <button
            onClick={() => {
              setIsRunning(false);
              setIsBreakPhase(false);
              resetTimer();
            }}
            className="mt-8 px-5 py-2 rounded-xl bg-sage-700 hover:bg-sage-600 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            Skip Break
          </button>
        </div>
      )}

      {/* Main UI Header */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sage-100 dark:bg-sage-900 text-sage-600 dark:text-sage-400">
              Wellness Timer
            </span>
            <h3 className="font-semibold text-lg text-sage-900 dark:text-sage-100 mt-1">{exercise.title}</h3>
          </div>
          {/* Fast Mode Toggle */}
          <div className="flex items-center space-x-2">
            <label className="text-[10px] text-sage-500 dark:text-sage-400 font-medium cursor-pointer flex items-center gap-1 select-none">
              <input
                type="checkbox"
                checked={fastMode}
                onChange={(e) => {
                  setFastMode(e.target.checked);
                  // Trigger reset with the correct mode immediately
                  setTimeout(() => resetTimer(), 50);
                }}
                className="rounded border-sage-300 text-sage-600 focus:ring-sage-500 w-3 h-3 cursor-pointer"
              />
              Fast Mode (10s)
            </label>
          </div>
        </div>
        <p className="text-xs text-sage-500 dark:text-sage-400 mt-1.5 leading-relaxed">{exercise.description}</p>
      </div>

      {/* Timer Circle */}
      <div className="my-6 flex justify-center items-center">
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Background circle */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="76"
              className="stroke-sage-100 dark:stroke-sage-900 fill-none"
              strokeWidth="6"
            />
            {/* Active progress circle */}
            <circle
              cx="88"
              cy="88"
              r="76"
              className="stroke-sage-500 dark:stroke-sage-400 fill-none transition-all duration-300"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 76}
              strokeDashoffset={2 * Math.PI * 76 * (1 - progressPercent / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Time display */}
          <div className="text-center z-10">
            <span className="text-3xl font-bold font-mono text-sage-900 dark:text-sage-100 block">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-sage-400 uppercase tracking-widest font-semibold mt-0.5 block">
              {isRunning ? "Running" : "Paused"}
            </span>
          </div>
        </div>
      </div>

      {/* Steps Guidance */}
      <div className="bg-sage-50/50 dark:bg-sage-900/20 border border-sage-200/5 rounded-xl p-3.5 min-h-[76px] flex items-start space-x-3">
        <div className="w-5 h-5 rounded-full bg-sage-500/10 text-sage-500 flex items-center justify-center shrink-0 mt-0.5">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-sage-400 dark:text-sage-500 uppercase tracking-wider block">
            Step {currentStepIdx + 1} of {exercise.steps.length}
          </span>
          <p className="text-xs text-sage-700 dark:text-sage-300 font-medium mt-0.5 leading-relaxed">
            {exercise.steps[currentStepIdx]}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-2 mt-4">
        <button
          onClick={toggleStartPause}
          className="flex-1 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 dark:bg-sage-500 dark:hover:bg-sage-600 text-white font-medium text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          onClick={() => resetTimer()}
          className="px-4 py-2.5 rounded-xl bg-sage-100 hover:bg-sage-200/60 dark:bg-sage-900 dark:hover:bg-sage-800 text-sage-700 dark:text-sage-300 font-medium text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Preset List Selection */}
      <div className="border-t border-sage-200/10 pt-4 mt-4 grid grid-cols-2 gap-1.5">
        {Object.values(EXERCISES).map((ex) => (
          <button
            key={ex.id}
            onClick={() => resetTimer(ex.id)}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-medium text-left transition-all cursor-pointer truncate ${
              selectedId === ex.id
                ? "bg-sage-500/10 border-sage-500/40 text-sage-800 dark:text-sage-200"
                : "bg-transparent border-sage-200/10 hover:bg-sage-100/40 dark:hover:bg-sage-900/40 text-sage-500 dark:text-sage-400"
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>
    </div>
  );
}
