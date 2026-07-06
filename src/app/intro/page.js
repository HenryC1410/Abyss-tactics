"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import styles from './Intro.module.css';

const fuenteHistoria = localFont({
  src: '../fonts/Qindret Demo.otf', 
  display: 'swap',
});

export default function IntroVisualNovel() {
  const router = useRouter();
  
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playerName, setPlayerName] = useState("Griff"); 
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false); 
  const intervalRef = useRef(null);

  
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const storyFrames = [
    {
      type: "input",
      speaker: "Gremio de Cazadores",
      text: "El Rey ha caído gravemente enfermo. La única cura requiere un ingrediente botánico que solo florece en las profundidades del Abismo. Cazador, ¿cómo debemos registrarte en el manifiesto?",
    },
    {
      type: "story",
      speaker: "Gremio de Cazadores",
      text: `Escucha bien, ${playerName}. Deberás descender a través de distintos niveles infestados de anomalías y bestias. Como estratega, cada paso en falso podría ser el último. Tu misión es neutralizarlas y recuperar el ítem.`,
    }
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
  }, [currentFrame]);

  
  const nextFrame = () => {
    
    if (isTyping) {
      clearInterval(intervalRef.current);
      setDisplayText(frame.text);
      setIsTyping(false);
      return;
    }

    if (frame.type === "input" && playerName.trim() === "") {
      setError(true);
      return;
    }

    setError(false);
    setIsVisible(false); 

    setTimeout(() => {
      if (currentFrame < storyFrames.length - 1) {
        setCurrentFrame(prev => prev + 1);
        setIsVisible(true); 
      } else {
        localStorage.setItem("abyssPlayerName", playerName);
        router.push('/tutorial');
      }
    }, 400);
  };

  return (
    <main
      className={`h-screen w-full flex flex-col justify-end p-4 md:p-8 relative overflow-hidden bg-slate-900 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      onClick={nextFrame} 
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

        <div className={`absolute -top-6 left-6 md:left-10 px-8 py-1 ${styles.namePlate} `}>
          <span className={`${fuenteHistoria.className} text-sky-400 font-bold text-xl md:text-2xl tracking-widest drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]`}>
            {frame.speaker}
          </span>
        </div>


        <p className={` text-slate-200 text-2xl md:text-3xl leading-relaxed mt-4 mb-6 min-h-25`}>
          {displayText}

          {isTyping && <span className={styles.cursor}>▍</span>}
        </p>


        {!isTyping && frame.type === "input" && (
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
            <div className="flex flex-col w-full sm:max-w-xs">
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  if (e.target.value.trim() !== "") setError(false);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') nextFrame(); }}
                className={`text-white px-4 py-3 rounded focus:outline-none text-lg font-bold tracking-wider w-full ${styles.inputName} ${error ? 'border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : ''}`}
                placeholder="Ingresa tu nombre..."
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              {error && <span className="text-red-500 text-sm mt-1">Requerido.</span>}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); nextFrame(); }}
              className={`bg-sky-900 text-sky-100 font-bold py-3 px-8 rounded border border-sky-700 uppercase tracking-wider ${styles.btnConfirm}`}
            >
              Confirmar
            </button>
          </div>
        )}

        {!isTyping && frame.type === "story" && (
          <div className="flex justify-end mt-4">
            <button 
              onClick={(e) => { e.stopPropagation(); nextFrame(); }}
              className={`bg-slate-800 text-white font-bold py-3 px-8 rounded border border-slate-600 uppercase tracking-wider ${styles.btnConfirm}`}
            >
              Siguiente ▸
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
