"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IntroVisualNovel() {
  const router = useRouter();
  

  const [currentFrame, setCurrentFrame] = useState(0);
  const [playerName, setPlayerName] = useState("Griff");
  
  const [isVisible, setIsVisible] = useState(true);


  const storyFrames = [
    {
      type: "input",
      title: "Registro de Mando",
      text: "El Abismo se ha abierto. Necesitamos un comandante para liderar la vanguardia. ¿Cuál es tu designación de combate?",
    },
    {
      type: "story",
      title: "Año 2084 - Las Grietas",
      text: `Entendido, ${playerName}. Las anomalías han empezado a cruzar desde el otro lado. Nuestro núcleo de energía es lo único que mantiene la barrera en pie.`,
    },
    {
      type: "story",
      title: "Protocolo de Defensa",
      text: "Te hemos asignado un mazo de tácticas abisales. Úsalas con sabiduría. Tu primera prueba está por comenzar... Prepárate para el combate.",
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
     
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-80"></div>

      
      <div 
        className={`z-10 w-full max-w-3xl bg-slate-950/80 border border-slate-700 p-8 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
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
              className="bg-black border border-slate-700 text-white px-4 py-3 rounded focus:outline-none focus:border-red-500 text-lg"
              placeholder="Ingresa tu nombre..."
            />
            <button 
              onClick={nextFrame}
              className="bg-red-950 hover:bg-red-800 text-red-100 font-bold py-3 px-6 rounded border border-red-700 transition-all self-end uppercase tracking-wider"
            >
              Confirmar Identidad
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button 
              onClick={nextFrame}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded border border-slate-600 transition-all uppercase tracking-wider"
            >
              {currentFrame === storyFrames.length - 1 ? "Iniciar Tutorial" : "Siguiente >"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}