"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import GameCard from "@/components/GameCard";
import styles from './Arena.module.css';

const fuenteHistoria = localFont({
  src: '../fonts/Qindret Demo.otf',
  display: 'swap',
});

// ── INDEXEDDB ────────────────────────────────────────────────────────────────
const guardarEnRanking = (nombre, tiempo, nivel, resultado) => {
  if (typeof window === "undefined" || !window.indexedDB) return;
  const request = indexedDB.open("AbyssRankings", 1);
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("scores"))
      db.createObjectStore("scores", { keyPath: "id", autoIncrement: true });
  };
  request.onsuccess = (e) => {
    const db = e.target.result;
    const store = db.transaction(["scores"], "readwrite").objectStore("scores");
    store.add({ nombre: nombre || "Griff", tiempo, nivel, resultado, fecha: new Date().toLocaleDateString() });
  };
};

// ── CARTAS ───────────────────────────────────────────────────────────────────
export const cardDatabase = [
  { id: 'a1', name: "Golpe Sombrío",      type: "ataque",     cost: 2, effectValue: 20,  description: "Daño físico básico." },
  { id: 'a2', name: "Tajo de Hierro",     type: "ataque",     cost: 2, effectValue: 25,  description: "Daño físico directo." },
  { id: 'a3', name: "Estocada Abisal",    type: "ataque",     cost: 3, effectValue: 35,  description: "Daño penetrante." },
  { id: 'a4', name: "Corte Penumbrante",  type: "ataque",     cost: 3, effectValue: 40,  description: "Daño físico severo." },
  { id: 'a5', name: "Furia del Cazador",  type: "ataque",     cost: 4, effectValue: 55,  description: "Ataque pesado masivo." },
  { id: 'e1', name: "Égida Menor",        type: "defensa",    cost: 1, effectValue: 15,  description: "Bloquea daño enemigo." },
  { id: 'e2', name: "Reflejo Táctico",    type: "defensa",    cost: 1, effectValue: 20,  description: "Bloquea daño rápidamente." },
  { id: 'e3', name: "Barrera de Éter",    type: "defensa",    cost: 2, effectValue: 30,  description: "Levanta un muro mágico." },
  { id: 'e4', name: "Muro de Piedra",     type: "defensa",    cost: 2, effectValue: 35,  description: "Fuerte barrera física." },
  { id: 'e5', name: "Escudo Abisal",      type: "defensa",    cost: 3, effectValue: 50,  description: "Protección casi total." },
  { id: 'h1', name: "Foco Táctico",       type: "habilidad",  cost: 0, effectValue: 5,   description: "Recuperas 5 pts de Energía." },
  { id: 'h2', name: "Sobrecarga",         type: "habilidad",  cost: 0, effectValue: 8,   description: "Ganas 8 Energía, pierdes 15 HP." },
  { id: 'h3', name: "Ráfaga Táctica",     type: "habilidad",  cost: 4, effectValue: 65,  description: "Impacto mágico táctico." },
  { id: 'h4', name: "Impacto de Éter",    type: "habilidad",  cost: 6, effectValue: 80,  description: "Ráfaga de energía pura." },
  { id: 'h5', name: "Llama del Abismo",   type: "habilidad",  cost: 6, effectValue: 85,  description: "Fuego oscuro calcinante." },
  { id: 'd1', name: "Ira del Rey Caído",  type: "definitiva", cost: 7, effectValue: 100, description: "Daño letal instantáneo." },
  { id: 'd2', name: "Juicio del Abismo",  type: "definitiva", cost: 8, effectValue: 120, description: "Aniquilación oscura." },
  { id: 'd3', name: "Réquiem de Espadas", type: "definitiva", cost: 7, effectValue: 110, description: "Lluvia de espadas mágicas." },
  { id: 'd4', name: "Tormenta de Maná",   type: "definitiva", cost: 9, effectValue: 135, description: "Poder puro del grimorio." },
  { id: 'd5', name: "Colapso Dimensional",type: "definitiva", cost: 10,effectValue: 150, description: "Destruye la realidad." },
];


const ENEMY_SPRITES = {
  1: "../enemigos/nivel1.png",   
  2: "../enemigos/nivel2.png",   
  3: "../enemigos/nivel3.png", 
  4: "../enemigos/nivel4.png",   
  5: "../enemigos/nivel5.png",   
};

export default function ArenaBattle() {
  const router = useRouter();

  // ── Estado del jugador ──
  const [playerName, setPlayerName]     = useState("Griff");
  const [playerHp, setPlayerHp]         = useState(100);
  const [playerMaxHp, setPlayerMaxHp]   = useState(100);
  const [energy, setEnergy]             = useState(15);
  const [maxEnergy, setMaxEnergy]       = useState(15);
  const [playerShield, setPlayerShield] = useState(0);
  const [hand, setHand]                 = useState([]);


  const [level, setLevel]               = useState(1);
  const [monsterName, setMonsterName]   = useState("");
  const [monsterHp, setMonsterHp]       = useState(100);
  const [monsterMaxHp, setMonsterMaxHp] = useState(100);
  const [monsterAttack, setMonsterAttack] = useState(20);
  const [enemySprite, setEnemySprite]   = useState(ENEMY_SPRITES[1]);

  // ── Estado UI ──
  const [systemMessage, setSystemMessage] = useState("Batalla Iniciada. El Abismo aguarda.");
  const [isEnemyTurn, setIsEnemyTurn]   = useState(false);
  const [isGameOver, setIsGameOver]     = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [tiempoS, setTiempoS]           = useState(0);
  const [mounted, setMounted]           = useState(false);
  const [impactType, setImpactType]     = useState(null);

  const enemyRef     = useRef(null); 
  const playerHudRef = useRef(null);


  const spawnDamageNumber = (ref, value, color = '#f87171') => {
    const el = ref.current;
    if (!el) return;
    const span = document.createElement('span');
    span.textContent = `-${value}`;
    span.style.cssText = `
      position:absolute; top:-10px; left:50%; transform:translateX(-50%);
      color:${color}; font-size:1.7rem; font-weight:900;
      text-shadow:0 0 10px ${color}, 0 2px 4px #000;
      pointer-events:none; white-space:nowrap; z-index:999;
    `;
    el.style.position = 'relative';
    el.appendChild(span);
    span.animate(
      [
        { opacity: 1, transform: 'translateX(-50%) translateY(0px)'  },
        { opacity: 0, transform: 'translateX(-50%) translateY(-55px)'},
      ],
      { duration: 950, easing: 'ease-out', fill: 'forwards' }
    ).onfinish = () => span.remove();
  };

  // Sacudida horizontal — el enemigo recibe golpe
  const shakeEnemy = () => {
    enemyRef.current?.animate(
      [
        { transform: 'translateX(0px)'   },
        { transform: 'translateX(-14px)' },
        { transform: 'translateX(14px)'  },
        { transform: 'translateX(-8px)'  },
        { transform: 'translateX(8px)'   },
        { transform: 'translateX(-3px)'  },
        { transform: 'translateX(0px)'   },
      ],
      { duration: 420, easing: 'ease-out' }
    );
  };

  // Flash de impacto en el enemigo (brillo rojo)
  const hitFlashEnemy = () => {
    enemyRef.current?.animate(
      [
        { filter: 'brightness(1) saturate(1)' },
        { filter: 'brightness(3.5) saturate(0) sepia(1) hue-rotate(310deg)' },
        { filter: 'brightness(1) saturate(1)' },
      ],
      { duration: 380, easing: 'ease-out' }
    );
  };

  // El enemigo "avanza" hacia el jugador antes de golpear
  const enemyLunge = () => {
    return new Promise((resolve) => {
      const anim = enemyRef.current?.animate(
        [
          { transform: 'translateX(0px)  scale(1)'     },
          { transform: 'translateX(-90px) scale(1.18)' },
          { transform: 'translateX(0px)  scale(1)'     },
        ],
        { duration: 520, easing: 'ease-in-out' }
      );
      if (anim) anim.onfinish = resolve;
      else resolve();
    });
  };

  // Sacudida vertical + tinte naranja en el HUD del jugador
  const shakePlayer = () => {
    playerHudRef.current?.animate(
      [
        { transform: 'translateY(0px)',  filter: 'brightness(1)'                       },
        { transform: 'translateY(-7px)', filter: 'brightness(2.2) hue-rotate(310deg)'  },
        { transform: 'translateY(7px)',  filter: 'brightness(1.5)'                     },
        { transform: 'translateY(-4px)', filter: 'brightness(1)'                       },
        { transform: 'translateY(0px)',  filter: 'brightness(1)'                       },
      ],
      { duration: 480, easing: 'ease-out' }
    );
  };

  // ── Cargar enemigo desde PokeAPI ─────────────────────────────────────────────
  const cargarEnemigo = async (nivelActual) => {
    setIsTransitioning(true);
    setMonsterName("");
    const pokeId = Math.floor(Math.random() * (nivelActual * 30)) + 1;
    try {
      const res  = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
      const data = await res.json();
      const baseHp  = data.stats[0].base_stat * (nivelActual * 0.8);
      const baseAtk = data.stats[1].base_stat * (nivelActual * 0.5);
      setMonsterName(`Anomalía ${data.name}`);
      const finalHp = Math.max(100, Math.floor(baseHp));
      setMonsterMaxHp(finalHp);
      setMonsterHp(finalHp);
      setMonsterAttack(Math.max(15, Math.floor(baseAtk)));
    } catch {
      const fallbackHp = 100 * nivelActual;
      setMonsterMaxHp(fallbackHp);
      setMonsterHp(fallbackHp);
      setMonsterAttack(20 * nivelActual);
      setMonsterName(`Anomalía Nivel ${nivelActual}`);
    }
    setEnemySprite(ENEMY_SPRITES[nivelActual] ?? ENEMY_SPRITES[1]);
    setSystemMessage(`Nivel ${nivelActual}: Un monstruo bloquea el camino.`);
    setIsTransitioning(false);
  };

  // ── Inicialización ───────────────────────────────────────────────────────────
  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("abyssProfile") || "null");
    if (profile) {
      setPlayerName(profile.name);
      setPlayerMaxHp(profile.maxHp);
      setPlayerHp(profile.maxHp);
      setMaxEnergy(profile.maxEnergy);
      setEnergy(profile.maxEnergy);
    }
    cargarEnemigo(1);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []); 

  // ── Cronómetro ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isGameOver || isTransitioning) return;
    const t = setInterval(() => setTiempoS(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isGameOver, isTransitioning]);

  // ── Game Over (jugador muere) ─────────────────────────────────────────────────
  useEffect(() => {
    if (playerHp <= 0 && !isGameOver && !isTransitioning) {
      setIsGameOver(true);
      setSystemMessage(`NÚCLEO DESTRUIDO. Tiempo: ${tiempoS}s. Volviendo al inicio...`);
      guardarEnRanking(playerName, tiempoS, level, "Derrota");
      localStorage.removeItem("abyssPlayerName");
      localStorage.removeItem("abyssProfile");
      setTimeout(() => router.push('/'), 3500);
    }
  }, [playerHp]); 

  useEffect(() => {
    if (monsterHp !== 0 || isTransitioning || isGameOver) return;
    setIsTransitioning(true);
    if (level < 5) {
      setSystemMessage("¡Anomalía destruida! Recalibrando el Grimorio...");
      setTimeout(() => {
        const next = level + 1;
        setLevel(next);
        setHand([]);
        setPlayerShield(0);
        if (next === 3) { setPlayerMaxHp(150); setPlayerHp(p => Math.min(p + 50, 150)); }
        if (next === 4) { setPlayerMaxHp(200); setPlayerHp(p => Math.min(p + 50, 200)); }
        const newMax = 15 + (next - 1) * 3;
        setMaxEnergy(newMax);
        setEnergy(newMax);
        cargarEnemigo(next);
      }, 2500);
    } else {
      setIsGameOver(true);
      setSystemMessage("¡MAZMORRA LIMPIADA! Abriendo portal de salida...");
      localStorage.setItem("abyssFinalTime", tiempoS);
      setTimeout(() => router.push('/epilogo'), 3500);
    }
  }, [monsterHp]); 

  const robarCartas = useCallback((cantidad = 4, nivelActual = level) => {
    const mult = nivelActual - 1;
    const nuevaMano = Array.from({ length: cantidad }, () => {
      const rand = Math.random() * 114;
      const tipo = rand <= 4 ? 'definitiva' : rand <= 14 ? 'habilidad' : rand <= 54 ? 'defensa' : 'ataque';
      const pool = cardDatabase.filter(c => c.type === tipo);
      const base = pool[Math.floor(Math.random() * pool.length)];
      const costo  = base.id === 'h1' || base.id === 'h2' ? base.cost  : base.cost + mult * 3;
      const efecto = (base.id === 'h1' || base.id === 'h2') ? base.effectValue
        : ['ataque','definitiva','h3','h4','h5'].some(t => t === tipo || t === base.id)
          ? Math.max(5, base.effectValue - mult * 5)
          : base.effectValue;
      return { ...base, uid: Math.random().toString(), cost: costo, effectValue: efecto };
    });
    setHand(nuevaMano);
  }, [level]);

  useEffect(() => {
    if (hand.length === 0 && !isEnemyTurn && !isTransitioning && !isGameOver && monsterHp > 0 && playerHp > 0)
      robarCartas(4, level);
  }, [monsterHp, isEnemyTurn, isTransitioning, isGameOver, playerHp, hand.length, robarCartas, level]);


  const handlePlayCard = (card, index) => {
    if (isEnemyTurn || isGameOver || isTransitioning) return;
    if (energy < card.cost) { setSystemMessage("Energía Insuficiente."); return; }

    setEnergy(prev => prev - card.cost);
    const newHand = hand.filter((_, i) => i !== index);
    setHand(newHand);

    const isAttack = ['ataque','definitiva'].includes(card.type) || ['h3','h4','h5'].includes(card.id);

    if (isAttack) {
      const critico = Math.random() > 0.5;
      const daño = critico ? card.effectValue : Math.floor(card.effectValue / 2);

      shakeEnemy();
      hitFlashEnemy();
      spawnDamageNumber(enemyRef, daño, '#f87171');
      setImpactType('red');
      setTimeout(() => setImpactType(null), 450);
      setMonsterHp(prev => Math.max(0, prev - daño));
      setSystemMessage(critico
        ? `¡Golpe Brutal! Causas ${daño} de daño y recuperas +2 Energía.`
        : `Golpe Parcial. Causas ${daño} de daño.`);
      if (critico) setEnergy(prev => Math.min(maxEnergy, prev + 2));

    } else if (card.type === 'defensa') {
      setPlayerShield(prev => prev + card.effectValue);

      playerHudRef.current?.animate(
        [
          { filter: 'brightness(1)' },
          { filter: 'brightness(2.5) hue-rotate(180deg)' },
          { filter: 'brightness(1)' },
        ],
        { duration: 400, easing: 'ease-out' }
      );
      setImpactType('blue');
      setTimeout(() => setImpactType(null), 450);
      setSystemMessage(`Égida activada: +${card.effectValue} Defensa.`);

    } else if (card.id === 'h1') {
      setEnergy(prev => Math.min(maxEnergy, prev + card.effectValue));
      setSystemMessage(`Foco Táctico: Recuperas ${card.effectValue} de Energía.`);
    } else if (card.id === 'h2') {
      setPlayerHp(prev => Math.max(0, prev - 15));
      setEnergy(prev => Math.min(maxEnergy, prev + card.effectValue));
      shakePlayer();
      spawnDamageNumber(playerHudRef, 15, '#fb923c');
      setSystemMessage(`Sobrecarga: Pierdes 15 HP, ganas ${card.effectValue} de Energía.`);
    }
  };

  
  const endTurn = async () => {
    if (isEnemyTurn || monsterHp === 0 || isGameOver || isTransitioning) return;
    setIsEnemyTurn(true);
    setSystemMessage("Turno del Enemigo...");


    await enemyLunge();

    const poderoso  = Math.random() > 0.5;
    const bruto     = poderoso ? monsterAttack : Math.floor(monsterAttack / 2);
    const final     = Math.max(0, bruto - playerShield);


    if (final > 0) {
      shakePlayer();
      spawnDamageNumber(playerHudRef, final, '#fb923c');
      setImpactType('red');
      setTimeout(() => setImpactType(null), 450);
    }

    setPlayerHp(prev => Math.max(0, prev - final));
    setPlayerShield(0);
    setSystemMessage(poderoso
      ? `La anomalía ataca con violencia: -${final} HP.`
      : `La anomalía lanza un ataque débil: -${final} HP.`);

    setTimeout(() => {
      const bonus = level >= 3 ? 6 : 2;
      setEnergy(prev => Math.min(maxEnergy, prev + bonus));
      robarCartas(4, level);
      setIsEnemyTurn(false);
    }, 1400);
  };


  return (
    <main className={`h-screen w-full flex flex-col relative overflow-hidden bg-slate-900 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

      
      {impactType && (
        <div className={`${styles.impactFlash} ${impactType === 'red' ? styles.impactFlashRed : styles.impactFlashBlue}`} />
      )}

      
      <div className="absolute inset-0 z-0">
        <img src="/calabozo.png" className="w-full h-full object-cover opacity-50" alt="Fondo" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>

      
      <header className="relative z-20 flex justify-between items-center px-4 md:px-8 pt-5">
        <span className={styles.headerPill}>Nivel {level} / 5</span>
        <span className={`${fuenteHistoria.className} text-white text-lg md:text-2xl tracking-widest opacity-60`}>
          Abyss Tactics
        </span>
        <span className={isGameOver ? styles.headerPillDanger : styles.headerPill}>
          {tiempoS}s
        </span>
      </header>

     
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-4 pointer-events-none">

        <div className={`${styles.enemyWrapper} ${monsterHp === 0 ? styles.dead : ''}`}>

          <img
            ref={enemyRef}
            src={enemySprite}
            alt={monsterName}
            className={isEnemyTurn ? styles.enemyImgAngry : styles.enemyImg}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />

          <div style={{ display: 'none' }}
            className="w-40 h-40 rounded-full bg-red-950/50 border-4 border-red-900 flex items-center justify-center shadow-[0_0_30px_rgba(153,27,27,0.5)] animate-pulse">
            <span className="text-red-500 font-bold uppercase text-xs text-center tracking-widest px-3">
              {isTransitioning ? "Cargando..." : monsterName}
            </span>
          </div>


          <div className={styles.hpTrack}>
            <div className={styles.hpFill} style={{ width: `${(monsterHp / monsterMaxHp) * 100}%` }} />
          </div>
          <p className="text-white text-xs font-bold tracking-widest">
            {isTransitioning ? "—" : monsterName} &nbsp;·&nbsp; {monsterHp} / {monsterMaxHp} HP
          </p>
          <p className="text-red-400 text-xs font-bold tracking-widest uppercase opacity-70">
            Amenaza: {monsterAttack}
          </p>
        </div>


        <div className="w-full max-w-xl px-4 pointer-events-auto">
          <div className={styles.systemBox}>
            <p className={`text-sm md:text-lg font-bold tracking-wider ${isGameOver ? 'text-red-500' : isEnemyTurn ? 'text-red-400' : 'text-sky-300'}`}>
              {systemMessage}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-30 w-full bg-slate-900/90 border-t border-slate-700 backdrop-blur-sm pt-3 pb-4 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-2">

          <div className="flex gap-2 w-full md:w-auto justify-center md:justify-start order-1">
            <div className={styles.statBox}>
              <p className="text-sky-400 font-bold uppercase tracking-widest text-xs mb-1">Energía</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{energy}</span>
                <span className="text-slate-400 font-bold text-xs">/ {maxEnergy}</span>
              </div>
            </div>

            <div ref={playerHudRef} className={`relative ${playerHp <= 30 ? styles.statBoxDanger : styles.statBoxGreen}`}>
              <p className={`font-bold uppercase tracking-widest text-xs mb-1 ${playerHp <= 30 ? 'text-red-400' : 'text-green-400'}`}>
                Núcleo
              </p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${playerHp <= 30 ? 'text-red-400' : 'text-white'}`}>{playerHp}</span>
                <span className="text-slate-400 font-bold text-xs">/ {playerMaxHp}</span>
              </div>
              {playerShield > 0 && (
                <div className="absolute -top-3 -right-3 bg-sky-600 border-2 border-slate-900 text-white font-black px-2 py-0.5 rounded-full text-xs shadow-lg animate-bounce">
                  +{playerShield}
                </div>
              )}
            </div>
          </div>


          <div className="flex gap-1 md:gap-3 justify-center relative z-40 order-3 md:order-2 -mt-10 md:-mt-16 scale-[0.75] md:scale-[0.85] origin-bottom">
            {hand.map((card, index) => (
              <div
                key={card.uid}
                onClick={() => handlePlayCard(card, index)}
                className={`transition-all duration-300 ${
                  isEnemyTurn || isGameOver || isTransitioning
                    ? styles.dimmedCard
                    : 'hover:-translate-y-6 hover:scale-105 cursor-pointer drop-shadow-[0_10px_10px_rgba(0,0,0,0.7)]'
                }`}
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

          {/* Botón terminar turno */}
          <div className="w-full md:w-auto flex justify-center order-2 md:order-3">
            <button
              onClick={endTurn}
              disabled={isEnemyTurn || playerHp <= 0 || isGameOver || isTransitioning}
              className={isEnemyTurn || playerHp <= 0 || isGameOver || isTransitioning
                ? styles.btnEndTurnDisabled
                : styles.btnEndTurn}
            >
              Terminar<br className="hidden md:block" /> Turno
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
