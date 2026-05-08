/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls, Environment as DreiEnvironment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { GameMode, GameState, Player, ShotResult } from './types';
import { Environment, Hoop } from './components/Three/Environment';
import { Ball } from './components/Three/Ball';
import { PlayerModel } from './components/Three/PlayerModel';
import { Trajectory } from './components/Three/Trajectory';
import { Scoreboard } from './components/UI/Scoreboard';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Info, Trophy, RotateCcw } from 'lucide-react';

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Studente 1', score: 0, shotsTaken: 0, shotsMade: 0 },
  { id: '2', name: 'Studente 2', score: 0, shotsTaken: 0, shotsMade: 0 }
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.SOLO);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isShooting, setIsShooting] = useState(false);
  const [power, setPower] = useState(7);
  const [angle, setAngle] = useState(45);
  const [fieldAngle, setFieldAngle] = useState(0); // Horizontal angle in degrees
  const [distance, setDistance] = useState(6);
  const [lastShot, setLastShot] = useState<ShotResult | undefined>();
  const [shotCount, setShotCount] = useState(0);

  // Reality-based constants
  const releaseHeight = 2.4; // High release for technical gesture visualization

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === GameState.PLAYING && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === GameState.PLAYING) {
      setGameState(GameState.FINISHED);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // AI Opponent Logic
  useEffect(() => {
    if (gameMode === GameMode.VS_COMPUTER && currentPlayerIndex === 1 && gameState === GameState.PLAYING && !isShooting) {
      const aiTimeout = setTimeout(() => {
        handleComputerShot();
      }, 2000);
      return () => clearTimeout(aiTimeout);
    }
  }, [gameMode, currentPlayerIndex, gameState, isShooting]);

    // Logic for random positioning
    const setRandomPosition = useCallback(() => {
      setDistance(3 + Math.random() * 9);
      setFieldAngle((Math.random() - 0.5) * 140);
    }, []);

    // Keyboard support for movement commands
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (isShooting || gameState !== GameState.PLAYING) return;
        
        const moveStep = 0.2;
        const angleStep = 2;

        switch(e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            setDistance(prev => Math.max(2.5, prev - moveStep));
            break;
          case 's':
          case 'arrowdown':
            setDistance(prev => Math.min(14, prev + moveStep));
            break;
          case 'a':
          case 'arrowleft':
            setFieldAngle(prev => Math.max(-85, prev - angleStep));
            break;
          case 'd':
          case 'arrowright':
            setFieldAngle(prev => Math.min(85, prev + angleStep));
            break;
          case 'r':
            setRandomPosition();
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isShooting, gameState, setRandomPosition]);

  const handleStart = (mode: GameMode, time: number) => {
    setGameMode(mode);
    setGameState(GameState.PLAYING);
    setTimeLeft(time);
    setPlayers(INITIAL_PLAYERS.map(p => ({ ...p, score: 0, shotsMade: 0, shotsTaken: 0 })));
    setCurrentPlayerIndex(0);
    setShotCount(0);
  };

  const handleReset = () => {
    setGameState(GameState.LOBBY);
    setTimeLeft(60);
  };

  const calculateScore = (dist: number) => {
    if (dist > 7) return 3;
    return 2;
  };

  const handleScore = useCallback(() => {
    setPlayers(prev => {
      const next = [...prev];
      const points = calculateScore(distance);
      next[currentPlayerIndex].score += points;
      next[currentPlayerIndex].shotsMade += 1;
      next[currentPlayerIndex].shotsTaken += 1;
      return next;
    });

    setLastShot({
      success: true,
      angle,
      power,
      distance,
      timestamp: Date.now(),
      playerId: players[currentPlayerIndex].id
    });

    finishTurn();
  }, [currentPlayerIndex, distance, angle, power]);

  const handleMiss = useCallback(() => {
    setPlayers(prev => {
      const next = [...prev];
      next[currentPlayerIndex].shotsTaken += 1;
      return next;
    });

    setLastShot({
      success: false,
      angle,
      power,
      distance,
      timestamp: Date.now(),
      playerId: players[currentPlayerIndex].id
    });

    finishTurn();
  }, [currentPlayerIndex, distance, angle, power]);

  const finishTurn = () => {
    setIsShooting(false);
    setShotCount(prev => prev + 1);
    
    if (gameMode !== GameMode.SOLO) {
      setCurrentPlayerIndex(prev => (prev === 0 ? 1 : 0));
    }
    
    // Change distance and angle randomly for variety
    setDistance(3 + Math.random() * 8);
    setFieldAngle((Math.random() - 0.5) * 120); // Random side angle
  };

  const handleShoot = () => {
    if (isShooting || gameState !== GameState.PLAYING) return;
    setIsShooting(true);
  };

  const handleComputerShot = () => {
    // Basic AI logic: it tries to aim correctly but has some random error
    const idealPower = 6 + (distance * 0.4); 
    const aiPower = idealPower + (Math.random() - 0.5) * 1.5;
    const aiAngle = 40 + (Math.random() * 15);
    const aiFieldAngle = (Math.random() - 0.5) * 60;
    
    setPower(aiPower);
    setAngle(aiAngle);
    setFieldAngle(aiFieldAngle);
    setIsShooting(true);
  };

  // Calculate 3D position based on distance and horizontal field angle
  // 0 degrees is straight ahead. Positive/Negative is left/right.
  const hoopZ = -13.5;
  const hoopX = 0;
  
  const radField = (fieldAngle * Math.PI) / 180;
  const playerX = hoopX + Math.sin(radField) * distance;
  const playerZ = hoopZ + Math.cos(radField) * distance;

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden relative font-sans select-none">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[12, 10, 12]} fov={50} />
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={10} 
          maxDistance={35} 
          target={[0, 2, -5]}
        />
        
        <Environment />
        <Hoop />
        
        <PlayerModel 
          position={[playerX, 0, playerZ]} 
          isShooting={isShooting} 
          color={currentPlayerIndex === 0 ? "#f97316" : "#22d3ee"} 
        />

        <Trajectory 
          power={power} 
          angle={angle} 
          startPos={[playerX, releaseHeight, playerZ]} 
          visible={!isShooting && gameState === GameState.PLAYING}
        />
        
        <Ball 
          shooting={isShooting}
          onScore={handleScore}
          onMiss={handleMiss}
          power={power}
          angle={angle}
          startPos={[playerX, releaseHeight, playerZ]}
        />

        {/* 3D Grid from Design */}
        <gridHelper args={[60, 20, 0x444444, 0x222222]} position={[0, 0.05, 0]} />

        <ContactShadows resolution={1024} scale={30} blur={2.5} opacity={0.4} far={15} color="#000" />
        <DreiEnvironment preset="night" />
      </Canvas>

      {/* Control Panel - Refined to match Design's Bottom Controls */}
      <AnimatePresence>
        {gameState === GameState.PLAYING && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 w-full h-36 bg-slate-900 border-t-4 border-slate-800 flex items-center px-12 gap-12 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
          >
            {/* Distance Slider */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">Distanza di tiro</label>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-black text-white">{distance.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">m</span>
                </div>
              </div>
              <input 
                type="range" 
                min="2.5" 
                max="12" 
                step="0.01"
                value={distance} 
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">
                <span>Area</span><span>Media</span><span>Tripla</span><span>Logo</span>
              </div>
            </div>

            <div className="h-16 w-px bg-slate-800/80" />

            {/* Field Angle Slider */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">Angolazione Campo</label>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-black text-white">{fieldAngle.toFixed(0)}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">°</span>
                </div>
              </div>
              <input 
                type="range" 
                min="-80" 
                max="80" 
                step="1"
                value={fieldAngle} 
                onChange={(e) => setFieldAngle(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">
                <span>Sinistra</span><span>Centro</span><span>Destra</span>
              </div>
            </div>

            <div className="h-16 w-px bg-slate-800/80" />

            {/* Angle Slider */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <label className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">Angolo di rilascio</label>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-black text-white">{angle}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">°</span>
                </div>
              </div>
              <input 
                type="range" 
                min="20" 
                max="85" 
                value={angle} 
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">
                <span>Teso</span><span>Ideale</span><span>Parabola Alta</span>
              </div>
            </div>

            {/* Power/Shoot Button */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1 w-24">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Release Power</span>
                <div className="text-xl font-mono font-black text-orange-500">{power.toFixed(1)}</div>
                <input 
                  type="range" 
                  min="4" 
                  max="16" 
                  step="0.1" 
                  value={power} 
                  onChange={(e) => setPower(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={setRandomPosition}
                disabled={isShooting}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} className="text-cyan-400" />
                Sposta Atleta [R]
              </button>

              <button 
                disabled={isShooting || (gameMode === GameMode.VS_COMPUTER && currentPlayerIndex === 1)}
                onClick={handleShoot}
                className={`h-22 px-14 rounded-3xl flex items-center gap-5 transition-all shadow-[0_0_40px_rgba(249,115,22,0.3)]
                  ${isShooting 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50 shadow-none' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95 group'
                  }
                `}
              >
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-1 opacity-80">Check Physics</span>
                  <span className="text-3xl font-black text-white italic uppercase tracking-tighter">SHOOT!</span>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target size={28} className="text-white" />
                </div>
              </button>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-[144px] w-full h-6 bg-orange-600 flex items-center justify-center z-30 pointer-events-none">
         <span className="text-[9px] font-black tracking-[0.3em] text-white uppercase italic">Virtual Laboratory // Physical Education // Biomechanics Simulator</span>
      </div>

      <Scoreboard 
        gameState={gameState}
        gameMode={gameMode}
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        timeLeft={timeLeft}
        lastShot={lastShot}
        onStart={handleStart}
        onReset={handleReset}
      />

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === GameState.FINISHED && (
          <motion.div 
            initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="absolute inset-0 bg-slate-950/95 z-[100] flex items-center justify-center p-6"
          >
            <div className="bg-slate-900 border-x-8 border-cyan-500 rounded-[50px] p-16 max-w-2xl w-full text-center shadow-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-orange-500" />
              
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-slate-800">
                <Trophy className="text-yellow-400" size={48} />
              </div>
              
              <h2 className="text-6xl font-black text-white italic tracking-tighter mb-4 uppercase shrink-0">Gara Conclusa!</h2>
              <p className="text-slate-500 font-mono text-sm tracking-widest mb-12 uppercase">Rapporto Finale di Competizione Virtuale</p>
              
              <div className="flex gap-10 mb-16">
                {players.map((p, i) => (
                  <div key={p.id} className="flex-1 bg-black/40 rounded-[32px] p-8 border-2 border-slate-800 relative group overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${i === 0 ? 'bg-orange-500' : 'bg-cyan-500'}`} />
                    <span className={`text-xs font-black uppercase tracking-[0.2em] mb-4 block ${i === 0 ? 'text-orange-400' : 'text-cyan-400'}`}>
                      {p.name}
                    </span>
                    <span className="text-7xl font-black text-white italic block mb-2 leading-none">{p.score}</span>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-2 px-4 bg-slate-800/50 rounded-full inline-block">
                      {p.shotsMade} / {p.shotsTaken} <span className="text-[8px] opacity-60 ml-1">FIELD GOALS</span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleReset}
                className="w-full bg-white text-slate-950 py-6 rounded-3xl font-black text-xl italic uppercase tracking-tighter shadow-2xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                Nuova Sessione
                <RotateCcw size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
