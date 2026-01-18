'use client';
import { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, ArrowRight, Trophy } from 'lucide-react';

export default function Lobby() {
  const { createRoom, joinRoom } = useSocket();
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'menu' | 'join' | 'create'>('menu');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return setError('Please enter your name');
    setLoading(true);
    try {
      await createRoom(name);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError(String(e));
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !roomId.trim()) return setError('Enter Name and Room ID');
    setLoading(true);
    try {
      await joinRoom(roomId, name);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError(String(e));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-casino-green rounded-full blur-[100px] opacity-30 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-casino-gold rounded-full blur-[100px] opacity-10" />
      </div>

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12 z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="text-casino-gold w-6 h-6 md:w-8 md:h-8" />
            <span className="text-casino-gold uppercase tracking-widest text-xs md:text-sm font-bold">The Royal Game</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight drop-shadow-2xl font-serif">
          ROYAL TENS
        </h1>
        <p className="text-white/60 text-base md:text-lg mt-4 max-w-md mx-auto px-4">
          Experience the classic Indian card game of strategy and partnership.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {mode === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col md:flex-row gap-6 z-10 w-full max-w-2xl"
          >
            {/* Create Room Card */}
            <button 
              onClick={() => setMode('create')}
              className="group flex-1 glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Play size={100} />
              </div>
              <Play className="text-casino-gold mb-4 w-10 h-10" />
              <h3 className="text-2xl font-bold text-white mb-2">New Game</h3>
              <p className="text-white/50">Host a new match and invite your friends via Room ID.</p>
              <div className="mt-8 flex items-center text-casino-gold font-bold text-sm tracking-wider group-hover:translate-x-2 transition-transform">
                CREATE ROOM <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </button>

            {/* Join Room Card */}
            <button 
              onClick={() => setMode('join')}
              className="group flex-1 glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Users size={100} />
              </div>
              <Users className="text-blue-400 mb-4 w-10 h-10" />
              <h3 className="text-2xl font-bold text-white mb-2">Join Game</h3>
              <p className="text-white/50">Enter an existing Room ID to join the table.</p>
              <div className="mt-8 flex items-center text-blue-400 font-bold text-sm tracking-wider group-hover:translate-x-2 transition-transform">
                ENTER LOBBY <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </button>
          </motion.div>
        )}

        {(mode === 'create' || mode === 'join') && (
            <motion.div 
                key="form"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="glass-panel p-8 rounded-2xl w-full max-w-md z-10"
            >
                <div className="mb-6">
                    <button onClick={() => { setMode('menu'); setError(''); }} className="text-white/50 hover:text-white text-sm mb-4">
                        ← Back to Menu
                    </button>
                    <h2 className="text-3xl font-bold text-white">
                        {mode === 'create' ? 'Host a Game' : 'Join a Game'}
                    </h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-white/70 text-sm mb-2 font-medium">YOUR NAME</label>
                        <input 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white placeholder-white/30 focus:outline-none focus:border-casino-gold transition-colors"
                        />
                    </div>

                    {mode === 'join' && (
                        <div>
                            <label className="block text-white/70 text-sm mb-2 font-medium">ROOM ID</label>
                            <input 
                                value={roomId}
                                onChange={e => setRoomId(e.target.value)}
                                placeholder="e.g. 1234"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white placeholder-white/30 focus:outline-none focus:border-casino-gold transition-colors font-mono tracking-widest text-center text-xl uppercase"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={mode === 'create' ? handleCreate : handleJoin}
                        disabled={loading}
                        className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transform transition-all 
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl'}
                            ${mode === 'create' 
                                ? 'bg-gradient-to-r from-casino-gold to-yellow-500 text-black' 
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            }`}
                    >
                        {loading ? 'Connecting...' : (mode === 'create' ? 'Create Room' : 'Join Room')}
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* DEBUG: Player Identity */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2 z-10 opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-white/30 font-mono">ID: {useSocket().playerId?.slice(0,8)}</span>
          <button 
            onClick={() => {
                sessionStorage.removeItem('royal_tens_uid');
                window.location.reload();
            }}
            className="text-[10px] text-red-400 border border-red-400/30 px-1 rounded hover:bg-red-500/10"
            title="Reset Identity (Fixes 'Duplicate Player' issue)"
          >
            RESET
          </button>
      </div>

    </div>
  );
}
