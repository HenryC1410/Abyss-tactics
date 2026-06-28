"use client";
import localFont from 'next/font/local';
import { useRef, useEffect } from 'react';
import Logo from "@/components/logo";
import Link from 'next/link';
import styles from './Home.module.css'; 

const miFuentePersonalizada = localFont({
  src: './fonts/IcelandWinterstorm.otf', 
  display: 'swap',
  preload: false,
});

export default function Home() {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const handleInteraction = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
    }
  };

  return (
    <main 
      className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 relative overflow-hidden"
      onClick={handleInteraction} 
    >
      <audio ref={audioRef} src="/Blessed to kill.ogg" loop autoPlay />

      <div className="z-10 flex flex-col items-center w-full max-w-4xl">
        
        <Logo className="w-32 h-32 md:w-40 md:h-40 -mb-4 relative z-20 animate-bounce [animation-duration:4s]" />

        <h1 className={`${miFuentePersonalizada.className} text-white tracking-wider text-center ${styles.titleGlow}`}>
          Abyss Tactics
        </h1>

        <div className="w-full max-w-[750px] relative z-0 mb-12 flex justify-center pointer-events-none">
          <img 
            src="/cards_hearts.gif" 
            alt="Fondo de cartas dinámico" 
            className="w-full h-auto object-contain opacity-85"
          />
        </div>

        <div className="flex flex-col gap-5 w-full max-w-[300px] relative z-10">
          
          <Link 
            href="/intro"
            className={`bg-red-950 hover:bg-red-800 text-red-100 font-bold py-4 px-8 rounded border border-red-700 uppercase tracking-widest text-lg text-center ${styles.btnStart}`}
          >
            Iniciar
          </Link>
          
          <button className={`bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-4 px-8 rounded border border-slate-700 uppercase tracking-widest text-lg ${styles.btnRanking}`}>
            Ranking
          </button>
          
        </div>

      </div>
    </main>
  );
}