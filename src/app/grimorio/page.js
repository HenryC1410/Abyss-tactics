"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import styles from '../intro/Intro.module.css';

const fuenteHistoria = localFont({
  src: '../fonts/Qindret Demo.otf',
  display: 'swap',
});

export default function GrimorioScene() {
  const router = useRouter();

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);   // fade-in de entrada
  const [playerName, setPlayerName] = useState("Cazador");
  const intervalRef = useRef(null);

  useEffect(() => {
    const name = localStorage.getItem("abyssPlayerName");
    if (name) setPlayerName(name);
  }, []);


  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const storyFrames = [
    {
      speaker: "Gremio de Cazadores",
      text: "Has superado la prueba inicial con creces. Tu mazo ha respondido a tu voluntad. Como recompensa, el Gremio ha desbloqueado las Habilidades y las técnicas Definitivas en tu Grimorio.",
    },
    {
      speaker: "Actualización de Protocolo",
      text: "Hemos recalibrado tus sistemas. Tu Energía máxima se ha expandido a 15 y tu Núcleo Vital ahora puede soportar hasta 100 HP. Estás listo para lo que aguarda en las profundidades.",
    },
    {
      speaker: "Gremio de Cazadores",
    
      get text() {
        return `La mazmorra no tendrá piedad, ${playerName}. Que tus cartas te guíen y tu estrategia no falle. Buena suerte en tu primer nivel, Cazador.`;
      },
    },
  ];

  const frame = storyFrames[currentFrame];

  useEffect(() => {
    setDisplayText("");
    setIsTyping(true);

    let i = 0;
    const fullText = frame.text;

    intervalRef.current = setInterval(() => {
      i++;
      setDisplayText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, 28);

    return () => clearInterval(intervalRef.current);
  }, [currentFrame, playerName]);
  
  const handleNext = () => {
    if (isTyping) {
      clearInterval(intervalRef.current);
      setDisplayText(frame.text);
      setIsTyping(false);
      return;
    }

    setIsVisible(false);

    setTimeout(() => {
      if (currentFrame < storyFrames.length - 1) {
        setCurrentFrame(currentFrame + 1);
        setIsVisible(true);
      } else {
        const playerProfile = {
          name: playerName,
          maxHp: 100,
          maxEnergy: 15,
          tutorialComplete: true,
        };
        localStorage.setItem("abyssProfile", JSON.stringify(playerProfile));
        router.push('/arena');
      }
    }, 400);
  };

  const isLastFrame = currentFrame === storyFrames.length - 1;

  return (
    <main
      className={`h-screen w-full flex flex-col justify-end p-4 md:p-8 relative overflow-hidden bg-slate-900 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleNext}
    >

      
      <div className={`absolute inset-0 z-0 ${styles.bgOverlay}`}>
        <img src="/calabozo.png" className="w-full h-full object-cover opacity-50" alt="Fondo" />
      </div>

      
      <div className="absolute bottom-0 left-10 z-30 pointer-events-none flex items-end">
        <img
          src="/P2.png"         
          alt="Personaje"
          className="h-[50vh] w-auto object-contain"
        />
      </div>

    
      <div
        className={`relative z-20 w-full max-w-5xl mx-auto p-6 md:p-8 mt-auto mb-2 md:mb-6 transition-opacity duration-300 ${styles.dialogBox} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >

     
        <div className={`absolute -top-6 left-6 md:left-10 px-8 py-1 ${styles.namePlate}`}>
          <span className={`${fuenteHistoria.className} text-sky-400 font-bold text-xl md:text-2xl tracking-widest drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]`}>
            {frame.speaker}
          </span>
        </div>

       
        <p className="text-slate-200 text-2xl md:text-3xl leading-relaxed mt-4 mb-6 min-h-25">
          {displayText}
          {isTyping && <span className={styles.cursor}>▍</span>}
        </p>

       
        {!isTyping && (
          <div className="flex justify-end mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className={`bg-slate-800 text-sky-300 font-bold py-3 px-8 rounded border border-sky-700 uppercase tracking-wider ${styles.btnConfirm}`}
            >
              {isLastFrame ? "Entrar al Abismo ▸" : "Siguiente ▸"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
