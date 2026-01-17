'use client';

import { useSocket } from "@/context/SocketContext";
import Lobby from "@/components/Lobby";
import GameBoard from "@/components/GameBoard";

export default function Home() {
  const { gameState } = useSocket();

  return (
    <main>
       {gameState ? <GameBoard /> : <Lobby />}
    </main>
  );
}
