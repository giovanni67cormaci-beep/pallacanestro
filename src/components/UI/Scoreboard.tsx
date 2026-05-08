
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  Target, 
  RotateCcw, 
  Play, 
  Users, 
  Cpu, 
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { GameMode, GameState, Player, ShotResult } from '../../types';
import { analyzeShot, answerQuestion } from '../../services/geminiService';

interface HUDProps {
  gameState: GameState;
  gameMode: GameMode;
  players: Player[];
  currentPlayerIndex: number;
  timeLeft: number;
  lastShot?: ShotResult;
  onStart: (mode: GameMode, time: number) => void;
  onReset: () => void;
}

export function Scoreboard({ 
  gameState, 
  gameMode, 
  players, 
  currentPlayerIndex, 
  timeLeft, 
  lastShot,
  onStart,
  onReset 
}: HUDProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisText, setAnalysisText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (lastShot && gameState === GameState.PLAYING) {
      handleAnalysis();
    }
  }, [lastShot]);

  const handleAnalysis = async () => {
    if (!lastShot) return;
    setIsAnalyzing(true);
    setAnalysisText("");
    const result = await analyzeShot(lastShot, players[currentPlayerIndex].name);
    setAnalysisText(result);
    setIsAnalyzing(false);
    setShowAnalysis(true);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setIsAnalyzing(true);
    const result = await answerQuestion(question, []);
    setAnswer(result);
    setIsAnalyzing(false);
  };

  if (gameState === GameState.LOBBY) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-[40px] p-10 max-w-lg w-full shadow-2xl overflow-hidden relative border-b-8 border-orange-600"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-cyan-500 to-orange-500" />
          
          <div className="text-center mb-10">
            <div className="inline-block bg-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white">
              Sperimentazione Fisica
            </div>
            <h1 className="text-6xl font-black text-white italic tracking-tighter flex items-center justify-center gap-2">
              BASKET<span className="text-orange-500">SIM</span>
            </h1>
            <p className="text-slate-400 font-mono text-sm tracking-widest mt-2 uppercase">Interactive Shooting Lab v4.2</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => onStart(GameMode.SOLO, 60)}
              className="w-full flex items-center justify-between p-5 bg-black/40 hover:bg-orange-500/10 rounded-3xl transition-all border-2 border-slate-800 hover:border-orange-500 group"
            >
              <div className="flex items-center gap-5">
                <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-orange-500 transition-all">
                  <Play className="text-orange-500 group-hover:text-white" size={28} />
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-xl italic uppercase">Pratica Singola</p>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tutorial Fisica & Biomeccanica</span>
                </div>
              </div>
              <ChevronRight className="text-slate-700 group-hover:text-orange-500" />
            </button>

            <button 
              onClick={() => onStart(GameMode.VS_FRIEND, 120)}
              className="w-full flex items-center justify-between p-5 bg-black/40 hover:bg-cyan-500/10 rounded-3xl transition-all border-2 border-slate-800 hover:border-cyan-500 group"
            >
              <div className="flex items-center gap-5">
                <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-cyan-500 transition-all">
                  <Users className="text-cyan-500 group-hover:text-white" size={28} />
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-xl italic uppercase">Sfida Compagno</p>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Competizione Locale 1v1</span>
                </div>
              </div>
              <ChevronRight className="text-slate-700 group-hover:text-cyan-500" />
            </button>

            <button 
              onClick={() => onStart(GameMode.VS_COMPUTER, 120)}
              className="w-full flex items-center justify-between p-5 bg-black/40 hover:bg-purple-500/10 rounded-3xl transition-all border-2 border-slate-800 hover:border-purple-500 group"
            >
              <div className="flex items-center gap-5">
                <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-purple-500 transition-all">
                  <Cpu className="text-purple-500 group-hover:text-white" size={28} />
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-xl italic uppercase">VS Computer</p>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Analisi predittiva bot</span>
                </div>
              </div>
              <ChevronRight className="text-slate-700 group-hover:text-purple-500" />
            </button>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex items-center justify-center gap-4">
            <span className="text-[9px] font-black tracking-[0.3em] text-slate-600 uppercase italic">Biomechanics Simulator // AI Enabled</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Top HUD Scoreboard */}
      <div className="absolute top-0 left-0 w-full h-24 bg-slate-900/90 backdrop-blur-md border-b-4 border-orange-500 flex items-center justify-between px-10 shadow-2xl z-40">
        {/* Player 1 */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-orange-400 font-black">Studente 01</span>
            <span className={`text-3xl font-black italic transition-all ${currentPlayerIndex === 0 ? 'text-white' : 'text-slate-600'}`}>
              PLAYER <span className="text-orange-500">.</span>
            </span>
          </div>
          <div className={`px-6 py-2 rounded-xl border-2 shadow-inner transition-all ${currentPlayerIndex === 0 ? 'bg-black border-orange-500' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
            <span className="text-4xl font-mono text-orange-500 font-bold">{players[0].score}</span>
          </div>
        </div>

        {/* Center Timer */}
        <div className="flex flex-col items-center">
          <div className="bg-red-600 px-6 py-1 rounded-t-lg text-[10px] font-black tracking-tighter uppercase text-white">Live Competition</div>
          <div className="bg-black border-4 border-slate-800 px-8 py-1 rounded-2xl flex items-center gap-3">
            <span className={`text-4xl font-mono font-bold tracking-tighter ${timeLeft < 10 ? 'text-red-500' : 'text-yellow-400'}`}>
              {formatTime(timeLeft)}
            </span>
            <div className={`w-3 h-3 rounded-full bg-red-500 ${timeLeft > 0 ? 'animate-pulse' : ''}`}></div>
          </div>
        </div>

        {/* Player 2 */}
        <div className="flex items-center gap-6 text-right">
          <div className={`px-6 py-2 rounded-xl border-2 shadow-inner transition-all ${currentPlayerIndex === 1 ? 'bg-black border-cyan-500' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
            <span className="text-4xl font-mono text-cyan-400 font-bold">{players[1].score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-black">
              {gameMode === GameMode.VS_COMPUTER ? 'AI Opponent' : 'Studente 02'}
            </span>
            <span className={`text-3xl font-black italic transition-all ${currentPlayerIndex === 1 ? 'text-white' : 'text-slate-600'}`}>
              {gameMode === GameMode.VS_COMPUTER ? 'PRO-BOT' : 'PLAYER 02'}
            </span>
          </div>
        </div>
      </div>

      {/* Self-Evaluation Interface */}
      <AnimatePresence>
        {showAnalysis && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute left-10 top-1/2 -translate-y-1/2 w-80 bg-white rounded-3xl p-8 text-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-40"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-xl italic shadow-[0_5px_15px_rgba(249,115,22,0.4)]">?</div>
              <h2 className="font-black uppercase italic tracking-tighter text-lg leading-none">Autovalutazione <br/> <span className="text-orange-500 text-sm">Tecnica IA</span></h2>
            </div>
            
            {isAnalyzing ? (
              <div className="flex flex-col gap-3 py-10 items-center">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 animate-spin rounded-full" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Elaborazione Fisica...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {analysisText}
                </div>
                
                <div className="h-px bg-slate-100 w-full" />

                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domanda alla fisica</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Perché è uscito?" 
                      className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                    <button 
                      onClick={handleAskQuestion}
                      className="p-3 bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                    >
                      <MessageSquare size={20} />
                    </button>
                  </div>
                  {answer && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[11px] p-4 bg-cyan-50 text-cyan-900 rounded-2xl border border-cyan-100 font-medium"
                    >
                      {answer}
                    </motion.div>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                  <span>Biomechanics Lab</span>
                  <span className="text-orange-500">Accuratezza: 98%</span>
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowAnalysis(false)} 
              className="absolute -top-3 -right-3 w-8 h-8 bg-slate-950 text-white rounded-full flex items-center justify-center font-bold hover:bg-red-500 transition-colors shadow-lg"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={onReset}
        className="absolute bottom-10 left-10 p-4 bg-slate-900/80 hover:bg-slate-950 backdrop-blur-md rounded-2xl text-slate-400 hover:text-white transition-all z-40 border border-slate-800"
      >
        <RotateCcw size={24} />
      </button>
    </>
  );
}
