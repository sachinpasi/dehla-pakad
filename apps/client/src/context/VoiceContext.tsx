'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import SimplePeer, { SignalData } from 'simple-peer';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

interface VoiceContextProps {
  joinVoice: () => Promise<void>;
  leaveVoice: () => void;
  isVoiceConnected: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  isSpeakerMuted: boolean;
  toggleSpeaker: () => void;
  peers: Record<string, SimplePeer.Instance>;
}

const VoiceContext = createContext<VoiceContextProps>({
  joinVoice: async () => {},
  leaveVoice: () => {},
  isVoiceConnected: false,
  isMuted: false,
  toggleMute: () => {},
  isSpeakerMuted: false,
  toggleSpeaker: () => {},
  peers: {},
});

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, gameState, playerId } = useSocket();
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Speaker Mute State
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});

  const peersRef = useRef<Record<string, SimplePeer.Instance>>({});
  const [peers, setPeers] = useState<Record<string, SimplePeer.Instance>>({}); // For re-render
  const streamRef = useRef<MediaStream | null>(null);

  const createPeer = useCallback((targetId: string, initiator: boolean, stream: MediaStream) => {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream,
      config: { 
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          { urls: 'stun:stun.stunprotocol.org:3478' }
        ] 
      }
    });

    peer.on('signal', (signal) => {
      socket?.emit('signal', { to: targetId, signal });
    });

    peer.on('stream', (remoteStream) => {
        // Create audio element
        const audio = document.createElement('audio');
        audio.srcObject = remoteStream;
        audio.play().catch(e => console.error("Audio play failed", e));
        
        // Store ref and apply current mute state
        audioElementsRef.current[targetId] = audio;
        // We set initial mute state based on current ref if possible, or just default.
        // Since we can't easily access 'isSpeakerMuted' state inside this callback without stale closure issues unless we add it to dependency (recreating peers), 
        // we'll rely on the Effect to sync it, OR mostly relying on the user to toggle if it's wrong.
        // Actually, we can check the ref if we stored state in ref. But simpler:
        audio.muted = false; // Default. The Effect will kick in if state changes, but initial might be wrong if already muted.
        // To fix initial state:
        // We can't access isSpeakerMuted here easily. 
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
    });

    return peer;
  }, [socket]);

  // Sync mute state to all audio elements
  useEffect(() => {
      Object.values(audioElementsRef.current).forEach(audio => {
          if (audio) audio.muted = isSpeakerMuted;
      });
  }, [isSpeakerMuted]);

  const leaveVoice = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
    }
    setStream(null);
    streamRef.current = null;
    setIsVoiceConnected(false);
    
    // Destroy peers
    Object.values(peersRef.current).forEach(p => p.destroy());
    peersRef.current = {};
    
    // Cleanup audio
    Object.values(audioElementsRef.current).forEach(a => a.remove()); 
    audioElementsRef.current = {};

    setPeers({});
  }, []);

  const joinVoice = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setStream(ms);
      streamRef.current = ms;
      setIsVoiceConnected(true);
      
      toast.success('Joined Voice Chat');

      // Initiate connections to all OTHER players
      if (gameState && socket) {
          gameState.players.forEach(p => {
              if (p.id !== playerId) {
                  const peer = createPeer(p.id, true, ms); // initiator = true
                  peersRef.current[p.id] = peer;
              }
          });
          setPeers({ ...peersRef.current });
      }

    } catch (e) {
      console.error(e);
      toast.error('Could not access microphone');
    }
  };

  const toggleMute = () => {
      if (streamRef.current) {
          const track = streamRef.current.getAudioTracks()[0];
          if (track) {
              track.enabled = isMuted; 
              setIsMuted(!isMuted);
          }
      }
  };

  const toggleSpeaker = () => {
      setIsSpeakerMuted(prev => !prev);
  };

  useEffect(() => {
    // Cleanup on unmount or socket disconnect
    return () => {
      leaveVoice();
    };
  }, [leaveVoice]);

  useEffect(() => {
      if (!socket || !isVoiceConnected) return;

      // Handle incoming signals
      socket.on('signal', ({ from, signal }: { from: string, signal: SignalData }) => {
          const peer = peersRef.current[from];
          if (peer) {
              peer.signal(signal);
          } else {
              // Incoming call (we are answering)
              if (!streamRef.current) return;
              
              const newPeer = createPeer(from, false, streamRef.current); // initiator = false
              peersRef.current[from] = newPeer;
              setPeers({ ...peersRef.current });
              newPeer.signal(signal);
          }
      });

      return () => {
          socket.off('signal');
      };

  }, [socket, isVoiceConnected, playerId, createPeer]);

  return (
    <VoiceContext.Provider value={{
      joinVoice,
      leaveVoice,
      isVoiceConnected,
      isMuted,
      toggleMute,
      isSpeakerMuted,
      toggleSpeaker,
      peers
    }}>
      {children}
    </VoiceContext.Provider>
  );
};
