"use client";
import localFont from 'next/font/local';
import { useRef, useEffect, useState } from 'react';
import Logo from "@/components/logo"; 
import { useRouter } from 'next/navigation';
import styles from './Home.module.css'; 

const miFuentePersonalizada = localFont({
  src: './fonts/IcelandWinterstorm.otf', 
  display: 'swap',
  preload: false,
});

export default function Home() {
  const audioRef = useRef(null);
  const router = useRouter();
  
  const [fading, setFading] = useState(false); 
  const [savedPlayer, setSavedPlayer] = useState(null); 

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }

    const playerName = localStorage.getItem("abyssPlayerName");
    if (playerName) {
      setSavedPlayer(playerName);
    }
  }, []);

  const handleInteraction = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
    }
  };

  const handleIniciar = (e) => {
    e.stopPropagation();
    localStorage.removeItem("abyssPlayerName"); 
    setFading(true);                       
    setTimeout(() => router.push('/intro'), 600); 
  };

  const handleContinuar = (e) => {
    e.stopPropagation();
    setFading(true);                       
    setTimeout(() => router.push('/grimorio'), 600); 
  };

  // NUEVO: Manejador para ir al Ranking
  const handleRanking = (e) => {
    e.stopPropagation();
    setFading(true);                       
    setTimeout(() => router.push('/ranking'), 600); 
  };

  return (
    <main 
      className={`min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-slate-900 transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleInteraction} 
    >
      <audio ref={audioRef} src="/Blessed to kill.ogg" loop autoPlay />

      <div className={`absolute inset-0 z-0 ${styles.bgOverlay}`}></div>

      <div className="z-10 flex flex-col items-center w-full max-w-4xl">

        <Logo className="w-32 h-32 md:w-40 md:h-40 -mb-4 relative z-20 animate-bounce [animation-duration:4s]" />

        <h1 className={`${miFuentePersonalizada.className} text-white tracking-wider text-center ${styles.titleGlow}`}>
          Abyss Tactics
        </h1>

        <div className="w-full max-w-187.5 relative z-0 mb-12 flex justify-center pointer-events-none">
          <img 
            src="/fondo_hearts.gif" 
            alt="Fondo de cartas dinámico" 
            className="w-full h-auto object-contain opacity-85"
          />
        </div>

        <div className="flex flex-col gap-4 w-full max-w-[320px] relative z-10">
          
          {savedPlayer ? (
            <>
              <button
                onClick={handleContinuar}
                className={`font-bold py-4 px-8 uppercase tracking-widest text-lg text-center rounded ${styles.btnStart}`}
              >
                Continuar ({savedPlayer})
              </button>
              
              <button
                onClick={handleIniciar}
                className="font-bold py-3 px-8 uppercase tracking-widest text-sm text-center rounded border border-red-800/50 bg-red-950/50 hover:bg-red-900 text-red-200 transition-all"
              >
                Nueva Partida
              </button>
            </>
          ) : (
            <button
              onClick={handleIniciar}
              className={`font-bold py-4 px-8 uppercase tracking-widest text-lg text-center rounded ${styles.btnStart}`}
            >
              Iniciar
            </button>
          )}
          
          {/* NUEVO: Botón de Ranking actualizado */}
          <button 
            onClick={handleRanking}
            className={`font-bold py-4 px-8 uppercase tracking-widest text-lg rounded ${styles.btnRanking}`}
          >
            Ranking
          </button>
          
        </div>
      </div>
    </main>
  );
}