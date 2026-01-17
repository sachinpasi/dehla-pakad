'use client';
import { useState } from 'react';
import { useSocket } from '@/context/SocketContext';

export default function Lobby() {
  const { createRoom, joinRoom } = useSocket();
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'menu' | 'join'>('menu');

  const handleCreate = async () => {
    if (!name) return setError('Enter Name');
    try {
      await createRoom(name);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError(String(e));
    }
  };

  const handleJoin = async () => {
    if (!name || !roomId) return setError('Enter Name and Room ID');
    try {
      await joinRoom(roomId, name);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError(String(e));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-800 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Dehla Pakad</h1>
      
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md border border-white/20">
        <label className="block mb-2 text-sm font-medium">Your Name</label>
        <input 
          className="w-full p-2 mb-4 rounded bg-black/30 border border-white/30 text-white focus:outline-none focus:border-yellow-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

        {mode === 'menu' ? (
          <div className="flex flex-col gap-3">
             <button 
                onClick={handleCreate}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded transition"
             >
               Create Room
             </button>
             <button 
                onClick={() => setMode('join')}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded transition"
             >
               Join Room
             </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
             <input 
              className="w-full p-2 rounded bg-black/30 border border-white/30 text-white focus:outline-none"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Room ID (4 digits)"
            />
            <button 
                onClick={handleJoin}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition"
             >
               Enter Room
             </button>
             <button 
                onClick={() => setMode('menu')}
                className="text-sm text-gray-300 hover:text-white"
             >
               Back
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
