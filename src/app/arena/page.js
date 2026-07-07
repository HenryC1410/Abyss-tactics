"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GameCard from "@/components/GameCard";
import styles from '../tutorial/Tutorial.module.css'; 

// ==========================================
// FUNCIÓN PARA GUARDAR EN INDEXEDDB (RANKING)
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
      nombre: nombre || "Griff",
      tiempo: tiempo,
      nivel: nivel,
      resultado: resultado, 
      fecha: new Date().toLocaleDateString()
    });
  };
};

// ==========================================
// BASE DE DATOS DE CARTAS
// ==========================================
export const cardDatabase = [
  { id: 'a1', name: "Golpe Sombrío", type: "ataque", cost: 2, effectValue: 20, description: "Daño físico básico." },
  { id: 'a2', name: "Tajo de Hierro", type: "ataque", cost: 2, effectValue: 25, description: "Daño físico directo." },
  { id: 'a3', name: "Estocada Abisal", type: "ataque", cost: 3, effectValue: 35, description: "Daño penetrante." },
  { id: 'a4', name: "Corte Penumbrante", type: "ataque", cost: 3, effectValue: 40, description: "Daño físico severo." },
  { id: 'a5', name: "Furia del Cazador", type: "ataque", cost: 4, effectValue: 55, description: "Ataque pesado masivo." },
  
  { id: 'e1', name: "Égida Menor", type: "defensa", cost: 1, effectValue: 15, description: "Bloquea daño enemigo." },
  { id: 'e2', name: "Reflejo Táctico", type: "defensa", cost: 1, effectValue: 20, description: "Bloquea daño rápidamente." },
  { id: 'e3', name: "Barrera de Éter", type: "defensa", cost: 2, effectValue: 30, description: "Levanta un muro mágico." },
  { id: 'e4', name: "Muro de Piedra", type: "defensa", cost: 2, effectValue: 35, description: "Fuerte barrera física." },
  { id: 'e5', name: "Escudo Abisal", type: "defensa", cost: 3, effectValue: 50, description: "Protección casi total." },
  
  { id: 'h1', name: "Foco Táctico", type: "habilidad", cost: 0, effectValue: 5, description: "Recuperas 5 pts de Energía." },
  { id: 'h2', name: "Sobrecarga", type: "habilidad", cost: 0, effectValue: 8, description: "Ganas 8 Energía, pierdes 15 HP." },
  { id: 'h3', name: "Ráfaga Táctica", type: "habilidad", cost: 4, effectValue: 65, description: "Impacto mágico táctico." },
  { id: 'h4', name: "Impacto de Éter", type: "habilidad", cost: 6, effectValue: 80, description: "Ráfaga de energía pura." },
  { id: 'h5', name: "Llama del Abismo", type: "habilidad", cost: 6, effectValue: 85, description: "Fuego oscuro calcinante." },
  
  { id: 'd1', name: "Ira del Rey Caído", type: "definitiva", cost: 7, effectValue: 100, description: "Daño letal instantáneo." },
  { id: 'd2', name: "Juicio del Abismo", type: "definitiva", cost: 8, effectValue: 120, description: "Aniquilación oscura." },
  { id: 'd3', name: "Réquiem de Espadas", type: "definitiva", cost: 7, effectValue: 110, description: "Lluvia de espadas mágicas." },
  { id: 'd4', name: "Tormenta de Maná", type: "definitiva", cost: 9, effectValue: 135, description: "Poder puro del grimorio." },
  { id: 'd5', name: "Colapso Dimensional", type: "definitiva", cost: 10, effectValue: 150, description: "Destruye la realidad." },
];

export default function ArenaBattle() {
  const router = useRouter();
  
  const [playerName, setPlayerName] = useState("Griff");
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [energy, setEnergy] = useState(15);
  const [maxEnergy, setMaxEnergy] = useState(15);
  const [playerShield, setPlayerShield] = useState(0);
  const [hand, setHand] = useState([]);
  
  const [level, setLevel] = useState(1);
  const [monsterName, setMonsterName] = useState("Anomalía");
  const [monsterHp, setMonsterHp] = useState(100);
  const [monsterMaxHp, setMonsterMaxHp] = useState(100);
  const [monsterAttack, setMonsterAttack] = useState(20);
  
  const [systemMessage, setSystemMessage] = useState("Batalla Iniciada. El Abismo aguarda.");
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false); 
  const [isTransitioning, setIsTransitioning] = useState(true); 
  const [tiempoS, setTiempoS] = useState(0); 

  // ==========================================
  // CONEXIÓN POKEAPI
  // ==========================================
  const cargarEnemigo = async (nivelActual) => {
    setIsTransitioning(true);
    const pokeId = Math.floor(Math.random() * (nivelActual * 30)) + 1; 
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
      const data = await res.json();
      
      const baseHp = data.stats[0].base_stat * (nivelActual * 0.8);
      const baseAtk = data.stats[1].base_stat * (nivelActual * 0.5);
      
      setMonsterName(`Anomalía ${data.name}`);
      const finalHp = Math.floor(baseHp) > 100 ? Math.floor(baseHp) : 100;
      setMonsterMaxHp(finalHp); 
      setMonsterHp(finalHp);
      setMonsterAttack(Math.floor(baseAtk) > 15 ? Math.floor(baseAtk) : 15);
      
      setSystemMessage(`Nivel ${nivelActual}: Un monstruo bloquea el camino.`);
    } catch (error) {
      const fallbackHp = 100 * nivelActual;
      setMonsterHp(fallbackHp);
      setMonsterMaxHp(fallbackHp);
      setMonsterAttack(20 * nivelActual);
      setSystemMessage(`Nivel ${nivelActual}: Un monstruo bloquea el camino.`);
    } finally {
      setIsTransitioning(false); 
    }
  };

  // ==========================================
  // 1. INICIALIZACIÓN DE PERFIL Y NIVEL 1
  // ==========================================
  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("abyssProfile"));
    if (profile) {
      setPlayerName(profile.name);
      setPlayerMaxHp(profile.maxHp);
      setPlayerHp(profile.maxHp);
      setMaxEnergy(profile.maxEnergy);
      setEnergy(profile.maxEnergy);
    }
    
    cargarEnemigo(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // 2. CRONÓMETRO INDEPENDIENTE
  // ==========================================
  useEffect(() => {
    let timer;
    if (!isGameOver && !isTransitioning) {
      timer = setInterval(() => {
        setTiempoS(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameOver, isTransitioning]);

  // ==========================================
  // GAME OVER (DERROTA)
  // ==========================================
  useEffect(() => {
    if (playerHp <= 0 && !isGameOver && !isTransitioning) {
      setIsGameOver(true);
      setSystemMessage(`NÚCLEO DESTRUIDO. Tiempo: ${tiempoS}s. Volviendo al inicio...`);
      guardarEnRanking(playerName, tiempoS, level, "Derrota");
      localStorage.removeItem("abyssPlayerName");
      localStorage.removeItem("abyssProfile");
      setTimeout(() => router.push('/'), 3500);
    }
  }, [playerHp, isGameOver, isTransitioning, playerName, tiempoS, level, router]);

  // ==========================================
  // VICTORIA O AVANCE DE NIVEL
  // ==========================================
  useEffect(() => {
    if (monsterHp === 0 && !isTransitioning && !isGameOver) {
      setIsTransitioning(true); 
      
      if (level < 5) {
        setSystemMessage("¡Anomalía destruida! Recalibrando el Grimorio...");
        
        setTimeout(() => {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          cargarEnemigo(nextLevel); 
          setHand([]); 
          setPlayerShield(0);
          
          if (nextLevel === 3) {
            setPlayerMaxHp(150);
            setPlayerHp(prev => prev + 50);
          } else if (nextLevel === 4) {
            setPlayerMaxHp(200);
            setPlayerHp(prev => prev + 50);
          }

          const newMaxEnergy = 15 + ((nextLevel - 1) * 3);
          setMaxEnergy(newMaxEnergy);
          setEnergy(newMaxEnergy); 
        }, 2500);

      } else {
        setIsGameOver(true);
        setSystemMessage(`¡MAZMORRA LIMPIADA! Tiempo final: ${tiempoS}s. Volviendo al inicio...`);
        guardarEnRanking(playerName, tiempoS, level, "Victoria");
        localStorage.removeItem("abyssPlayerName");
        localStorage.removeItem("abyssProfile");
        setTimeout(() => router.push('/'), 3500);
      }
    }
  }, [monsterHp, isTransitioning, level, isGameOver, playerName, tiempoS, router]);

  // ==========================================
  // ROBAR CARTAS (CON BLINDAJE A CARTAS DE ENERGÍA)
  // ==========================================
  const robarCartas = useCallback((cantidad = 4, nivelActual = level) => {
    const nuevaMano = [];
    const multiplicador = nivelActual - 1; 

    for (let i = 0; i < cantidad; i++) {
      const rand = Math.random() * 114; 
      let tipoElegido = 'ataque';
      
      if (rand <= 4) tipoElegido = 'definitiva'; 
      else if (rand <= 14) tipoElegido = 'habilidad'; 
      else if (rand <= 54) tipoElegido = 'defensa'; 

      const cartasDelTipo = cardDatabase.filter(c => c.type === tipoElegido);
      const cartaBase = cartasDelTipo[Math.floor(Math.random() * cartasDelTipo.length)];
      
      let nuevoCosto = cartaBase.cost;
      let nuevoEfecto = cartaBase.effectValue;

      if (cartaBase.id !== 'h1' && cartaBase.id !== 'h2') {
        nuevoCosto += (multiplicador * 3); 
        
        if (["ataque", "definitiva"].includes(tipoElegido) || ['h3', 'h4', 'h5'].includes(cartaBase.id)) {
          nuevoEfecto = Math.max(5, nuevoEfecto - (multiplicador * 5)); 
        }
      }

      nuevaMano.push({
        ...cartaBase, 
        uid: Math.random().toString(),
        cost: nuevoCosto,
        effectValue: nuevoEfecto
      }); 
    }
    setHand(nuevaMano);
  }, [level]);

  useEffect(() => {
    if (hand.length === 0 && !isEnemyTurn && !isTransitioning && !isGameOver && monsterHp > 0 && playerHp > 0) {
      robarCartas(4, level);
    }
  }, [monsterHp, isEnemyTurn, isTransitioning, isGameOver, playerHp, robarCartas, hand.length, level]);

  // ==========================================
  // ACCIÓN DE JUGAR CARTA
  // ==========================================
  const handlePlayCard = (card, index) => {
    if (isEnemyTurn || isGameOver || isTransitioning) return;

    if (energy < card.cost) {
      setSystemMessage("Energía Insuficiente.");
      return;
    }

    setEnergy(prev => prev - card.cost);
    
    if (["ataque", "definitiva"].includes(card.type) || ['h3', 'h4', 'h5'].includes(card.id)) {
      const dañoTotal = Math.random() > 0.5; 
      const dañoInfligido = dañoTotal ? card.effectValue : Math.floor(card.effectValue / 2);
      
      setMonsterHp(prev => Math.max(0, prev - dañoInfligido));
      
      if (dañoTotal) {
        setSystemMessage(`¡Golpe Brutal! Causas ${dañoInfligido} de daño y recuperas +2 Energía.`);
        setEnergy(prev => Math.min(maxEnergy, prev + 2)); 
      } else {
        setSystemMessage(`Golpe Parcial. Causas ${dañoInfligido} de daño.`);
      }

    } else if (card.type === "defensa") {
      setPlayerShield(prev => prev + card.effectValue);
      setSystemMessage(`Égida activada: +${card.effectValue} Defensa.`);
      
    } else if (card.id === 'h1') {
      setEnergy(prev => Math.min(maxEnergy, prev + card.effectValue));
      setSystemMessage(`Foco Táctico: Recuperas ${card.effectValue} de Energía.`);
      
    } else if (card.id === 'h2') {
      setPlayerHp(prev => Math.max(0, prev - 15)); 
      setEnergy(prev => Math.min(maxEnergy, prev + card.effectValue));
      setSystemMessage(`Sobrecarga: Pierdes 15 HP, ganas ${card.effectValue} de Energía.`);
    }

    const newHand = [...hand];
    newHand.splice(index, 1);
    setHand(newHand);
  };

  // ==========================================
  // TURNO DEL ENEMIGO
  // ==========================================
  const endTurn = () => {
    if (isEnemyTurn || monsterHp === 0 || isGameOver || isTransitioning) return;
    setIsEnemyTurn(true);
    setSystemMessage("Turno del Enemigo...");

    setTimeout(() => {
      const ataquePoderoso = Math.random() > 0.5;
      const dañoRecibidoBruto = ataquePoderoso ? monsterAttack : Math.floor(monsterAttack / 2);
      const dañoTrasEscudo = Math.max(0, dañoRecibidoBruto - playerShield);
      
      setPlayerHp(prev => Math.max(0, prev - dañoTrasEscudo));
      setPlayerShield(0); 

      if (ataquePoderoso) {
        setSystemMessage(`La anomalía ataca con violencia: -${dañoTrasEscudo} HP.`);
      } else {
        setSystemMessage(`La anomalía lanza un ataque débil: -${dañoTrasEscudo} HP.`);
      }

      setTimeout(() => {
        // +6 de energía a partir del nivel 3
        const energiaTurno = level >= 3 ? 6 : 2;
        setEnergy(prev => Math.min(maxEnergy, prev + energiaTurno)); 
        
        robarCartas(4, level); 
        setIsEnemyTurn(false);
      }, 1500);

    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950 to-black pointer-events-none"></div>

      <div className="relative z-10 w-full flex justify-between text-slate-400 font-bold mb-4 px-4 md:px-8">
        <span className="tracking-widest uppercase">Nivel {level} / 5</span>
        <span className={`${isGameOver ? 'text-red-500 animate-pulse' : ''} tracking-widest`}>Tiempo: {tiempoS}s</span>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 px-4 md:px-8">
        <div className="flex gap-4">
          <div className="bg-slate-900 border-2 border-sky-600 rounded-lg p-4 shadow-[0_0_15px_rgba(2,132,199,0.3)] min-w-[130px]">
            <p className="text-sky-400 font-bold uppercase tracking-widest text-xs mb-1">Energía</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black text-white">{energy}</span>
              <span className="text-slate-400 font-bold mb-1">/ {maxEnergy}</span>
            </div>
          </div>
          
          <div className={`bg-slate-900 border-2 rounded-lg p-4 min-w-[150px] relative transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)] ${playerHp <= 0 ? 'border-red-600 shadow-[0_0_20px_red]' : 'border-green-600'}`}>
            <p className={`${playerHp <= 0 ? 'text-red-500' : 'text-green-400'} font-bold uppercase tracking-widest text-xs mb-1`}>Núcleo</p>
            <div className="flex items-end gap-1">
              <span className={`text-4xl font-black ${playerHp <= 0 ? 'text-red-500' : 'text-white'}`}>{playerHp}</span>
              <span className="text-slate-400 font-bold mb-1">/ {playerMaxHp}</span>
            </div>
            {playerShield > 0 && (
              <div className="absolute -top-3 -right-3 bg-sky-600 border-2 border-white text-white font-black px-3 py-1 rounded-full shadow-lg text-sm animate-bounce">
                +{playerShield}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className={`w-32 h-32 md:w-40 md:h-40 bg-slate-900/50 border-4 border-red-900 rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(153,27,27,0.5)] ${(isEnemyTurn || isTransitioning) && !isGameOver ? 'animate-pulse border-red-500 bg-red-950/50' : ''}`}>
             <span className="text-red-500 font-bold text-sm md:text-base uppercase tracking-widest text-center px-2">{isTransitioning ? "Cargando..." : monsterName}</span>
          </div>
          
          <div className="w-56 h-4 bg-slate-900 mt-4 rounded-full overflow-hidden border border-slate-700">
             <div className="bg-red-600 h-full transition-all duration-500" style={{width: `${(monsterHp / monsterMaxHp) * 100}%`}}></div>
          </div>
          <p className="text-white text-sm font-bold mt-2 tracking-wider">HP: {monsterHp} / {monsterMaxHp}</p>
          <p className="text-slate-400 text-xs font-bold uppercase mt-1">Ataque Base: <span className="text-red-400">{monsterAttack}</span></p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto my-6 bg-slate-900/80 border border-slate-700 p-4 rounded-lg text-center min-h-[70px] flex items-center justify-center backdrop-blur-sm shadow-xl">
        <p className={`text-lg md:text-xl font-bold tracking-wider ${isGameOver ? 'text-red-500 scale-105' : isEnemyTurn ? 'text-red-400' : 'text-sky-300'}`}>
          {systemMessage}
        </p>
      </div>

      <div className="relative z-20 w-full max-w-6xl mx-auto mt-auto flex flex-col items-center">
        <div className="w-full flex justify-end px-4 mb-4">
          <button 
            onClick={endTurn} 
            disabled={isEnemyTurn || playerHp <= 0 || isGameOver || isTransitioning}
            className={`font-bold py-3 px-8 rounded border-2 uppercase tracking-widest transition-all ${isEnemyTurn || isGameOver || isTransitioning ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-red-950 hover:bg-red-800 text-white border-red-700'}`}
          >
            Terminar Turno
          </button>
        </div>

        <div className="flex gap-3 md:gap-4 flex-wrap justify-center mb-6">
          {hand.map((card, index) => (
            <div 
              key={card.uid} 
              onClick={() => handlePlayCard(card, index)} 
              className={`transition-all duration-300 ${isEnemyTurn || isGameOver || isTransitioning ? 'opacity-40 pointer-events-none grayscale' : 'hover:-translate-y-4 cursor-pointer'}`}
            >
              <GameCard 
                name={card.name} 
                type={card.type} 
                cost={card.cost} 
                effectValue={card.effectValue} 
                description={card.id === 'h1' || card.id === 'h2' ? card.description : `${card.description} (Lvl ${level})`}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}