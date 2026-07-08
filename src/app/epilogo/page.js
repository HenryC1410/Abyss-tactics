"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import styles from '../intro/Intro.module.css';

const fuenteHistoria = localFont({
  src: '../fonts/Qindret Demo.otf',
  display: 'swap',
});

const guardarVictoria = (nombre, tiempo, logro) => {
  if (typeof window === "undefined" || !window.indexedDB) return;
  const request = indexedDB.open("AbyssRankings", 1);
  request.onsuccess = (e) => {
    const db = e.target.result;
    db.transaction(["scores"], "readwrite")
      .objectStore("scores")
      .add({
        nombre: nombre || "Griff",
        tiempo,
        nivel: 5,
        resultado: "Victoria",
        logro,
        fecha: new Date().toLocaleDateString()
      });
  };
};

export default function EpilogoScene() {
  const router = useRouter();

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isVisible, setIsVisible]       = useState(true);
  const [displayText, setDisplayText]   = useState("");
  const [isTyping, setIsTyping]         = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [playerName, setPlayerName]     = useState("Cazador");
  const intervalRef                     = useRef(null);

  useEffect(() => {
    const name = localStorage.getItem("abyssPlayerName");
    if (name) setPlayerName(name);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const storyFrames = [
    {
      speaker: "Gremio de Cazadores",
      text: `Las lecturas de energía oscura se han desvanecido. Lo has logrado, ${playerName}. El núcleo de la anomalía ha colapsado y Haz conseguido item para salvar al Rey .`,
    },
    {
      speaker: "Gremio de Cazadores",
      text: "Tu grimorio ha registrado cada táctica, cada golpe. Has demostrado ser más que un simple novato. Eres un verdadero estratega del Abismo.",
    },
    {
      speaker: "Sistema",
      text: `Por la presente, el Gremio te otorga el título oficial de "Cazador del Abismo". Vuelve a la base, héroe. Es hora de descansar.`,
    },
  ];

  const frame = storyFrames[currentFrame];

  // ── Typewriter ────────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(intervalRef.current);
    setDisplayText("");
    setIsTyping(true);
    let i = 0;
    const full = frame.text;
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, 28);
    return () => clearInterval(intervalRef.current);
  }, [currentFrame, playerName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Click en escena: completar texto o avanzar ────────────────────────────
  const handleAdvance = () => {
    if (isTyping) {
      clearInterval(intervalRef.current);
      setDisplayText(frame.text);
      setIsTyping(false);
      return;
    }
    if (currentFrame < storyFrames.length - 1) {
      goNext();
    }
  };

  const goNext = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (currentFrame < storyFrames.length - 1) {
        setCurrentFrame(f => f + 1);
        setIsVisible(true);
      }
    }, 400);
  };

  const handleFinish = () => {
    const finalTime = parseInt(localStorage.getItem("abyssFinalTime") || "0");
    guardarVictoria(playerName, finalTime, "Cazador del Abismo");
    localStorage.removeItem("abyssPlayerName");
    localStorage.removeItem("abyssProfile");
    localStorage.removeItem("abyssFinalTime");
    router.push('/');
  };

  const isLastFrame = currentFrame === storyFrames.length - 1;

  return (
    <main
      className={`h-screen w-full flex flex-col justify-end p-4 md:p-8 relative overflow-hidden bg-slate-900 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleAdvance}
    >


      <div className="absolute inset-0 z-0">
        <img src="/calabozo.png" className="w-full h-full object-cover opacity-50" alt="Fondo" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-slate-950/20" />
      </div>

      {/* ── SPRITE DEL PERSONAJE ───────────────────────────────────────────────
          👉 Coloca el PNG del personaje en /public/sprites/
          Ejemplo: src="/sprites/guildmaster_victory.png"
          Tamaño recomendado: fondo transparente, ~400-600px de ancho.       */}
      <div className="absolute bottom-0 left-10 z-30 pointer-events-none flex items-end">
        <img
          src="/P2.png"
          alt="Personaje"
          className="h-[50vh] w-auto object-contain"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ── CUADRO DE DIÁLOGO (igual que intro y grimorio) ─────────────────── */}
      <div
        className="relative z-20 w-full max-w-5xl mx-auto mb-2 md:mb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${frame.speaker === 'Sistema' ? styles.dialogBoxEnemy ?? styles.dialogBox : styles.dialogBox} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          style={{ padding: '24px 32px 28px 32px', position: 'relative', borderRadius: '12px' }}
        >

          {/* Nameplate */}
          <div className={`absolute -top-6 left-6 md:left-10 px-8 py-1 ${styles.namePlate}`}>
            <span className={`${fuenteHistoria.className} font-bold text-xl md:text-2xl tracking-widest drop-shadow-[0_0_5px_rgba(56,189,248,0.8)] ${frame.speaker === 'Sistema' ? 'text-yellow-400' : 'text-sky-400'}`}>
              {frame.speaker}
            </span>
          </div>

          {/* Texto con typewriter */}
          <p className="text-slate-200 text-2xl md:text-3xl leading-relaxed mt-4 mb-6 min-h-20">
            {displayText}
            {isTyping && <span className={styles.cursor}>▍</span>}
          </p>

          {/* Botones — solo cuando termina de escribir */}
          {!isTyping && (
            <div className="flex justify-end gap-3">
              {!isLastFrame && (
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="bg-slate-800 text-sky-300 font-bold py-2 px-6 rounded border border-sky-700 uppercase tracking-wider text-sm hover:bg-slate-700 transition-all"
                >
                  Siguiente ▸
                </button>
              )}
              {isLastFrame && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleFinish(); }}
                  className="bg-sky-900 text-sky-100 font-bold py-2 px-6 rounded border border-sky-700 uppercase tracking-wider text-sm hover:bg-sky-800 transition-all"
                >
                  Aceptar Título y Salir ▸
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
