"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GameCard from "@/components/GameCard";
import styles from '../tutorial/Tutorial.module.css'; 

// ==========================================
// FUNCIÓN PARA GUARDAR EN INDEXEDDB
// ==========================================
const guardarEnRanking = (nombre, tiempo, nivel, resultado) => {
  if (typeof window === "undefined" || !window.indexedDB) return;
  
  const request = indexedDB.open("AbyssRankings", 1);
  
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("scores")) {
      db.createObjectStore("scores", { keyPath: "id", autoIncrement: true });
    }
  };
  
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(["scores"], "readwrite");
    const store = transaction.objectStore("scores");
    
    store.add({
      nombre: nombre || "Cazador Caído",
      tiempo: tiempo,
      nivel: nivel,
      resultado: resultado, // "Victoria" o "Derrota"
      fecha: new Date().toLocaleDateString()
    });
  };
};

// ==========================================
// BASE DE DATOS DE CARTAS
// ==========================================
export const cardDatabase = [
  { id: 'a1', name: "Golpe Sombrío", type: "ataque", cost: 2, effectValue: 20, description: "Causa 20 pts de daño básico a la anomalía." },
  { id: 'a2', name: "Tajo de Hierro", type: "ataque", cost: 2, effectValue: 25, description: "Causa 25 pts de daño directo." },
  { id: 'a3', name: "Estocada Abisal", type: "ataque", cost: 3, effectValue: 35, description: "Causa 35 pts de daño penetrante." },
  { id: 'a4', name: "Corte Penumbrante", type: "ataque", cost: 3, effectValue: 40, description: "Causa 40 pts de daño severo." },
  { id: 'a5', name: "Furia del Cazador", type: "ataque", cost: 4, effectValue: 55, description: "Ataque pesado. Causa 55 pts de daño masivo." },
  
  { id: 'e1', name: "Égida Menor", type: "defensa", cost: 1, effectValue: 15, description: "Bloquea 15 pts de daño." },
  { id: 'e2', name: "Reflejo Táctico", type: "defensa", cost: 1, effectValue: 20, description: "Bloquea 20 pts de daño." },
  { id: 'e3', name: "Barrera de Éter", type: "defensa", cost: 2, effectValue: 30, description: "Bloquea 30 pts de daño." },
  { id: 'e4', name: "Muro de Piedra", type: "defensa", cost: 2, effectValue: 35, description: "Bloquea 35 pts de daño físico." },
  { id: 'e5', name: "Escudo Abisal", type: "defensa", cost: 3, effectValue: 50, description: "Bloquea 50 pts de daño." },
  
  { id: 'h1', name: "Visión Estratégica", type: "habilidad", cost: 2, effectValue: 0, description: "Roba 2 cartas adicionales." },
  { id: 'h2', name: "Drenaje de Alma", type: "habilidad", cost: 3, effectValue: 20, description: "Restaura 20 HP a tu núcleo." },
  { id: 'h3', name: "Foco Táctico", type: "habilidad", cost: 1, effectValue: 0, description: "Ganas +3 de Energía extra." },
  { id: 'h4', name: "Bruma Curativa", type: "habilidad", cost: 2, effectValue: 15, description: "Restaura 15 HP." },
  { id: 'h5', name: "Sacrificio", type: "habilidad", cost: 0, effectValue: 0, description: "Pierdes 5 HP, ganas 4 Energía." },
  
  { id: 'd1', name: "Ira del Rey Caído", type: "definitiva", cost: 7, effectValue: 100, description: "Causa 100 pts de daño letal." },
  { id: 'd2', name: "Juicio del Abismo", type: "definitiva", cost: 8, effectValue: 120, description: "Causa 120 pts de daño." },
  { id: 'd3', name: "Réquiem", type: "definitiva", cost: 6, effectValue: 80, description: "Causa 80 pts de daño." },
  { id: 'd4', name: "Bastión Absoluto", type: "definitiva", cost: 5, effectValue: 200, description: "Ganas 200 de Escudo." },
  { id: 'd5', name: "Colapso Dimensional", type: "definitiva", cost: 9, effectValue: 150, description: "Causa 150 pts de daño." },
];

export default function ArenaBattle() {
  const router = useRouter();
  
  // Estados Globales del Jugador
  const [playerName, setPlayerName] = useState("Griff");
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [energy, setEnergy] = useState(15);
  const [playerShield, setPlayerShield] = useState(0);
  const [hand, setHand] = useState([]);
  
  // Estados del Monstruo / Nivel
  const [level, setLevel] = useState(1);
  const [monsterName, setMonsterName] = useState("Anomalía");
  const [monsterHp, setMonsterHp] = useState(100);
  const [monsterMaxHp, setMonsterMaxHp] = useState(100);
  const [monsterAttack, setMonsterAttack] = useState(20);
  
  // Estados del Sistema de Combate
  const [systemMessage, setSystemMessage] = useState("Batalla Iniciada. El Abismo aguarda.");
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false); // Para detener interacciones al morir/ganar
  const [tiempoS, setTiempoS] = useState(0); 

  // ==========================================
  // INICIALIZACIÓN Y CRONÓMETRO
  // ==========================================
  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("abyssProfile"));
    if (profile) {
      setPlayerName(profile.name);
      setPlayerHp(profile.maxHp);
      setPlayerMaxHp(profile.maxHp);
      setEnergy(profile.maxEnergy);
    }

    const timer = setInterval(() => {
      if (!isGameOver) setTiempoS(t => t + 1);
    }, 1000);
    
    cargarEnemigo(1);
    
    return () => clearInterval(timer);
  }, [isGameOver]);

  // ==========================================
  // LÓGICA DE DERROTA (GAME OVER)
  // ==========================================
  useEffect(() => {
    if (playerHp <= 0 && !isGameOver) {
      setIsGameOver(true);
      setSystemMessage(`NÚCLEO DESTRUIDO. Tiempo: ${tiempoS}s. Volviendo al inicio...`);
      
      // 1. Guardar ranking
      guardarEnRanking(playerName, tiempoS, level, "Derrota");
      
      // 2. Limpiar progreso
      localStorage.removeItem("abyssPlayerName");
      localStorage.removeItem("abyssProfile");
      
      // 3. Redirigir al menú principal
      setTimeout(() => {
        router.push('/');
      }, 3500);
    }
  }, [playerHp, isGameOver, playerName, tiempoS, level, router]);

  // ==========================================
  // LÓGICA DE VICTORIA O AVANCE DE NIVEL
  // ==========================================
  useEffect(() => {
    if (monsterHp === 0 && !isEnemyTurn && !isGameOver) {
      if (level < 5) {
        setSystemMessage("¡Anomalía destruida! Avanzando al siguiente nivel...");
        setIsEnemyTurn(true); // Bloquear pantalla temporalmente
        setTimeout(() => {
          setLevel(l => l + 1);
          cargarEnemigo(level + 1);
          setHand([]); 
          setPlayerShield(0);
          setIsEnemyTurn(false);
        }, 2000);
      } else {
        // GANÓ EL JUEGO (Nivel 5 Completado)
        setIsGameOver(true);
        setSystemMessage(`¡MAZMORRA LIMPIADA! Tiempo final: ${tiempoS}s. Volviendo al inicio...`);
        
        guardarEnRanking(playerName, tiempoS, level, "Victoria");
        localStorage.removeItem("abyssPlayerName");
        localStorage.removeItem("abyssProfile");
        
        setTimeout(() => {
          router.push('/');
        }, 3500);
      }
    }
  }, [monsterHp, isEnemyTurn, level, isGameOver, playerName, tiempoS, router]);

  // ==========================================
  // GENERADOR DE CARTAS (CON PROBABILIDADES)
  // ==========================================
  const robarCartas = useCallback((cantidad = 4) => {
    const nuevaMano = [];
    for (let i = 0; i < cantidad; i++) {
      const rand = Math.random() * 114; 
      let tipoElegido = 'ataque';
      
      if (rand <= 4) tipoElegido = 'definitiva'; 
      else if (rand <= 14) tipoElegido = 'habilidad'; 
      else if (rand <= 54) tipoElegido = 'defensa'; 

      const cartasDelTipo = cardDatabase.filter(c => c.type === tipoElegido);
      const cartaAlAzar = cartasDelTipo[Math.floor(Math.random() * cartasDelTipo.length)];
      nuevaMano.push({...cartaAlAzar, uid: Math.random().toString()}); 
    }
    setHand(nuevaMano);
  }, []);

  useEffect(() => {
    if (hand.length === 0 && !isEnemyTurn && !isGameOver && monsterHp > 0 && playerHp > 0) {
      robarCartas(4);
    }
  }, [monsterHp, isEnemyTurn, isGameOver, playerHp, robarCartas, hand.length]);

  // ==========================================
  // CONEXIÓN POKEAPI PARA EL ENEMIGO
  // ==========================================
  const cargarEnemigo = async (nivelActual) => {
    const pokeId = Math.floor(Math.random() * (nivelActual * 30)) + 1; 
    
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
      const data = await res.json();
      
      const baseHp = data.stats[0].base_stat * (nivelActual * 0.8);
      const baseAtk = data.stats[1].base_stat * (nivelActual * 0.5);
      
      setMonsterName(`Anomalía ${data.name}`);
      setMonsterMaxHp(Math.floor(baseHp) > 100 ? Math.floor(baseHp) : 100); 
      setMonsterHp(Math.floor(baseHp) > 100 ? Math.floor(baseHp) : 100);
      setMonsterAttack(Math.floor(baseAtk) > 15 ? Math.floor(baseAtk) : 15);
      
      setSystemMessage(`Nivel ${nivelActual}: Una nueva anomalía aparece.`);
    } catch (error) {
      setMonsterHp(100 * nivelActual);
      setMonsterMaxHp(100 * nivelActual);
      setMonsterAttack(20 * nivelActual);
    }
  };

  // ==========================================
  // LÓGICA DE JUGAR CARTAS
  // ==========================================
  const handlePlayCard = (card, index) => {
    if (isEnemyTurn || isGameOver) return;

    if (energy < card.cost) {
      setSystemMessage("Energía Insuficiente.");
      return;
    }

    setEnergy(prev => prev - card.cost);
    
    if (card.type === "ataque" || card.type === "definitiva") {
      const dañoTotal = Math.random() > 0.5; 
      const dañoInfligido = dañoTotal ? card.effectValue : Math.floor(card.effectValue / 2);
      
      setMonsterHp(prev => Math.max(0, prev - dañoInfligido));
      
      if (dañoTotal) {
        setSystemMessage(`¡Golpe Total! Causas ${dañoInfligido} de daño y recuperas 2 Energía.`);
        setEnergy(prev => prev + 2); 
      } else {
        setSystemMessage(`Golpe Parcial. Causas ${dañoInfligido} de daño.`);
      }

    } else if (card.type === "defensa") {
      setPlayerShield(prev => prev + card.effectValue);
      setSystemMessage(`Levantas un escudo de ${card.effectValue} pts.`);
      
    } else if (card.type === "habilidad") {
      if (card.id === 'h1') robarCartas(2);
      if (card.id === 'h2' || card.id === 'h4') setPlayerHp(p => Math.min(playerMaxHp, p + card.effectValue));
      if (card.id === 'h3') setEnergy(e => e + 3);
      if (card.id === 'h5') { setPlayerHp(p => p - 5); setEnergy(e => e + 4); }
      setSystemMessage(`Habilidad usada: ${card.name}`);
    }

    const newHand = [...hand];
    newHand.splice(index, 1);
    setHand(newHand);
  };

  // ==========================================
  // TURNO DEL ENEMIGO
  // ==========================================
  const endTurn = () => {
    if (isEnemyTurn || monsterHp === 0 || isGameOver) return;
    setIsEnemyTurn(true);
    setSystemMessage("Turno del Enemigo...");

    setTimeout(() => {
      const ataquePoderoso = Math.random() > 0.5;
      const dañoRecibidoBruto = ataquePoderoso ? monsterAttack : Math.floor(monsterAttack / 2);
      const dañoTrasEscudo = Math.max(0, dañoRecibidoBruto - playerShield);
      
      setPlayerHp(prev => Math.max(0, prev - dañoTrasEscudo));
      setPlayerShield(0); 

      if (ataquePoderoso) {
        setSystemMessage(`El monstruo golpea con furia: -${dañoTrasEscudo} HP.`);
      } else {
        setSystemMessage(`Ataque débil del monstruo: -${dañoTrasEscudo} HP.`);
      }

      // Si el jugador no murió por el ataque, reiniciar su turno
      setTimeout(() => {
        setEnergy(prev => Math.min(profileEnergyMax(), prev + 2)); // Usamos 15 temporalmente, luego lo lees del perfil si quieres
        robarCartas(4); 
        setIsEnemyTurn(false);
      }, 1500);

    }, 1500);
  };

  // Helper para el tope de energía
  const profileEnergyMax = () => {
    const profile = JSON.parse(localStorage.getItem("abyssProfile"));
    return profile ? profile.maxEnergy : 15;
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950 to-black pointer-events-none"></div>

      <div className="relative z-10 w-full flex justify-between text-slate-400 font-bold mb-4">
        <span>Nivel {level} / 5</span>
        <span className={isGameOver ? 'text-red-500 animate-pulse' : ''}>Tiempo: {tiempoS}s</span>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-sky-600 rounded p-4 shadow-lg min-w-[120px]">
            <p className="text-sky-400 font-bold text-xs mb-1">ENERGÍA</p>
            <p className="text-3xl font-black text-white">{energy}</p>
          </div>
          <div className={`bg-slate-900 border rounded p-4 shadow-lg min-w-[120px] relative transition-all ${playerHp <= 0 ? 'border-red-600 shadow-[0_0_20px_red]' : 'border-green-600'}`}>
            <p className={`${playerHp <= 0 ? 'text-red-500' : 'text-green-400'} font-bold text-xs mb-1`}>NÚCLEO</p>
            <p className={`text-3xl font-black ${playerHp <= 0 ? 'text-red-500' : 'text-white'}`}>{playerHp}</p>
            {playerShield > 0 && (
              <div className="absolute -top-3 -right-3 bg-sky-600 text-white font-black px-2 py-1 rounded shadow-lg text-sm">
                +{playerShield}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className={`w-32 h-32 md:w-48 md:h-48 bg-slate-900/50 border-2 border-red-900 rounded-lg flex items-center justify-center transition-all ${isEnemyTurn && !isGameOver ? 'animate-bounce border-red-500 shadow-[0_0_20px_red]' : ''}`}>
             <span className="text-red-500 font-bold text-xl uppercase tracking-widest text-center">{monsterName}</span>
          </div>
          
          <div className="w-full bg-slate-800 h-4 mt-4 rounded overflow-hidden border border-slate-700">
             <div className="bg-red-600 h-full transition-all duration-300" style={{width: `${(monsterHp / monsterMaxHp) * 100}%`}}></div>
          </div>
          <p className="text-white text-sm font-bold mt-1">HP: {monsterHp} / {monsterMaxHp}</p>
          <p className="text-slate-400 text-xs">Ataque Base: {monsterAttack}</p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto my-8 bg-black/60 border border-slate-800 p-4 rounded text-center min-h-[60px] flex items-center justify-center transition-all">
        <p className={`text-xl font-bold tracking-wider ${isGameOver ? 'text-red-500 scale-110' : isEnemyTurn ? 'text-red-400' : 'text-sky-300'}`}>
          {systemMessage}
        </p>
      </div>

      <div className="relative z-20 w-full max-w-6xl mx-auto mt-auto flex flex-col items-center">
        
        <div className="w-full flex justify-end px-4 mb-4">
          <button 
            onClick={endTurn} 
            disabled={isEnemyTurn || playerHp <= 0 || isGameOver}
            className={`font-bold py-3 px-8 rounded border-2 uppercase transition-all ${isEnemyTurn || isGameOver ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-red-950 hover:bg-red-800 text-white border-red-700'}`}
          >
            Terminar Turno
          </button>
        </div>

        <div className="flex gap-4 flex-wrap justify-center mb-4">
          {hand.map((card, index) => (
            <div 
              key={card.uid} 
              onClick={() => handlePlayCard(card, index)} 
              className={`transition-all duration-300 ${isEnemyTurn || isGameOver ? 'opacity-50 pointer-events-none grayscale' : 'hover:-translate-y-4 cursor-pointer'}`}
            >
              <GameCard 
                name={card.name} 
                type={card.type} 
                cost={card.cost} 
                effectValue={card.effectValue} 
                description={card.description}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}