"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GameCard from "@/components/GameCard";
import styles from './Tutorial.module.css';

export default function TutorialBattle() {
  const router = useRouter();
  
  const [step, setStep] = useState(0);
  const [playerName, setPlayerName] = useState("Griff");
  const [monsterHp, setMonsterHp] = useState(15); // Vida de la anomalía

  // Recuperamos el nombre que guardaste en la introducción
  useEffect(() => {
    const storedName = localStorage.getItem("abyssPlayerName");
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  const tutorialSteps = [
    {
      title: "Alerta de Proximidad",
      text: `¡Atención, ${playerName}! Una Anomalía Menor ha bloqueado el acceso al primer nivel. Prepárate para el combate.`,
      action: "next" // Solo botón de siguiente
    },
    {
      title: "Fase de Ataque",
      text: "Tu núcleo de energía está estable. Selecciona la carta 'Golpe Sombrío' de tu mano para neutralizar la amenaza.",
      action: "wait" // Espera a que el jugador haga clic en la carta
    },
    {
      title: "Impacto Confirmado",
      text: "¡Impacto directo! La anomalía ha sido destruida y el camino está despejado. Excelente trabajo, cazador.",
      action: "finish" // Botón para ir a la siguiente historia
    }
  ];

  const currentStepData = tutorialSteps[step];

  // Función que se ejecuta cuando el jugador hace clic en la carta brillante
  const handlePlayCard = () => {
    if (step === 1) {
      setMonsterHp(0); // La anomalía muere
      setStep(2);      // Avanzamos al último diálogo
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-8 relative overflow-hidden">
      {/* FONDO OSCURO */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950 to-black pointer-events-none"></div>

      {/* ÁREA DEL ENEMIGO (La Anomalía) */}
      <div className="relative z-10 flex flex-col items-center mt-12 transition-all duration-500">
        <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-red-900 flex items-center justify-center shadow-[0_0_30px_rgba(153,27,27,0.5)] transition-all duration-700 ${monsterHp === 0 ? 'opacity-0 scale-50 blur-xl' : 'animate-pulse bg-red-950/50'}`}>
          <span className="text-red-500 font-bold tracking-widest uppercase">Anomalía</span>
        </div>
        
        {/* Barra de Vida del Enemigo */}
        <div className={`w-48 h-4 bg-slate-900 border border-slate-700 mt-4 rounded overflow-hidden transition-opacity ${monsterHp === 0 ? 'opacity-0' : 'opacity-100'}`}>
          <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(monsterHp / 15) * 100}%` }}></div>
        </div>
        <p className={`text-slate-400 text-sm mt-1 font-bold ${monsterHp === 0 ? 'opacity-0' : 'opacity-100'}`}>HP: {monsterHp} / 15</p>
      </div>

      {/* CUADRO DE DIÁLOGO DEL TUTORIAL (Centrado) */}
      <div className={`z-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-6 rounded-lg ${styles.tutorialBox}`}>
        <h2 className="text-red-400 text-lg font-bold uppercase tracking-widest border-b border-red-900/50 pb-2 mb-4">
          [ Sistema ] - {currentStepData.title}
        </h2>
        <p className="text-white text-xl mb-6">
          {currentStepData.text}
        </p>
        
        <div className="flex justify-end">
          {currentStepData.action === "next" && (
            <button 
              onClick={() => setStep(step + 1)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded border border-slate-600 uppercase tracking-wider transition-all"
            >
              Entendido
            </button>
          )}
          {currentStepData.action === "finish" && (
            <button 
              onClick={() => router.push('#')} // Redirige a la siguiente parte de la historia
              className="bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-6 rounded border border-red-700 uppercase tracking-wider transition-all"
            >
              Continuar
            </button>
          )}
        </div>
      </div>

      {/* LA MANO DEL JUGADOR */}
      <div className="relative z-20 flex gap-4 flex-wrap justify-center mb-8 w-full max-w-5xl">
        
        {/* Carta 1: La que el jugador DEBE usar */}
        <div onClick={handlePlayCard} className={step === 1 ? styles.highlightCard : styles.dimmedCard}>
          <GameCard 
            name="Golpe Sombrío" 
            type="ataque" 
            cost={1} 
            effectValue={15} 
            description="Causa 15 puntos de daño directo a la anomalía."
          />
        </div>
        
        {/* Cartas 2 y 3: Oscurecidas porque el sistema no deja usarlas aún */}
        <div className={styles.dimmedCard}>
          <GameCard 
            name="Égida Abisal" 
            type="defensa" 
            cost={2} 
            effectValue={20} 
            description="Bloquea 20 puntos de daño durante este turno."
          />
        </div>
        
        <div className={styles.dimmedCard}>
          <GameCard 
            name="Poción de Éter" 
            type="curacion" 
            cost={1} 
            effectValue={25} 
            description="Restaura 25 puntos de salud de tu núcleo."
          />
        </div>
      </div>
    </main>
  );
}