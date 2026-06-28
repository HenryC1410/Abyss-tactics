"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Intro.module.css';

export default function IntroVisualNovel() {
  const router = useRouter();
  
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playerName, setPlayerName] = useState("Griff"); 
  const [isVisible, setIsVisible] = useState(true);

  const storyFrames = [
    {
      type: "input",
      title: "Gremio de Cazadores",
      text: "El Rey ha caído gravemente enfermo. La única cura requiere un ingrediente botánico que solo florece en las profundidades del Abismo. Cazador, ¿cómo debemos registrarte en el manifiesto?",
    },
    {
      type: "story",
      title: "La Gran Mazmorra",
      text: `Escucha bien, ${playerName}. Deberás descender a través de 16 niveles infestados de anomalías y bestias. Como estratega, cada paso en falso podría ser el último. Tu misión es neutralizarlas y recuperar el ítem.`,
    },
    {
      type: "story",
      title: "El Grimorio Táctico",
      text: "No sobrevivirás solo con acero. Para defenderte, usarás un mazo de cartas que representan habilidades mágicas ancestrales. Administra tu energía y destruye a los monstruos. El descenso comienza ahora.",
    }
  ];

  const nextFrame = () => {
    setIsVisible(false); 
    
    setTimeout(() => {
      if (currentFrame < storyFrames.length - 1) {
        setCurrentFrame(currentFrame + 1);
        setIsVisible(true); 
      } else {
        localStorage.setItem("abyssPlayerName", playerName);
        router.push('/arena');
      }
    }, 500); 
  };

  const frame = storyFrames[currentFrame];

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative">
      {/* 2. Fondo optimizado con CSS */}
      <div className={`absolute inset-0 ${styles.bgOverlay}`}></div>

      {/* 3. Cuadro de diálogo modular */}
      <div 
        className={`z-10 w-full max-w-3xl p-8 rounded-lg transition-opacity duration-500 ${styles.dialogBox} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <h2 className="text-red-500 text-xl font-bold uppercase tracking-widest border-b border-slate-800 pb-4 mb-6">
          {frame.title}
        </h2>
        
        <p className="text-slate-300 text-lg leading-relaxed mb-8 min-h-[80px]">
          {frame.text}
        </p>

        {frame.type === "input" ? (
          <div className="flex flex-col gap-4">
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={`text-white px-4 py-3 rounded focus:outline-none text-lg font-bold tracking-wider ${styles.inputName}`}
              placeholder="Ingresa tu nombre..."
            />
            <button 
              onClick={nextFrame}
              className={`bg-red-950 text-red-100 font-bold py-3 px-6 rounded border border-red-700 uppercase tracking-wider self-end ${styles.btnConfirm}`}
            >
              Confirmar Registro
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button 
              onClick={nextFrame}
              className={`bg-slate-800 text-white font-bold py-3 px-6 rounded border border-slate-600 uppercase tracking-wider ${styles.btnNext}`}
            >
              {currentFrame === storyFrames.length - 1 ? "Entrar a la Mazmorra" : "Siguiente >"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}