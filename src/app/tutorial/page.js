"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import GameCard from "@/components/GameCard";
import styles from './Tutorial.module.css';

const fuenteHistoria = localFont({
  src: '../fonts/Qindret Demo.otf',
  display: 'swap',
});


export const cardDatabase = [
  { id: 'a1', name: "Golpe Sombrío",     type: "ataque",     cost: 2, effectValue: 20,  description: "Causa 20 pts de daño básico a la anomalía." },
  { id: 'a2', name: "Tajo de Hierro",    type: "ataque",     cost: 2, effectValue: 25,  description: "Causa 25 pts de daño directo." },
  { id: 'a3', name: "Estocada Abisal",   type: "ataque",     cost: 3, effectValue: 35,  description: "Causa 35 pts de daño penetrante." },
  { id: 'a4', name: "Corte Penumbrante", type: "ataque",     cost: 3, effectValue: 40,  description: "Causa 40 pts de daño severo." },
  { id: 'a5', name: "Furia del Cazador", type: "ataque",     cost: 4, effectValue: 55,  description: "Ataque pesado. Causa 55 pts de daño masivo." },
  { id: 'e1', name: "Égida Menor",       type: "defensa",    cost: 1, effectValue: 15,  description: "Bloquea 15 pts de daño enemigo." },
  { id: 'e2', name: "Reflejo Táctico",   type: "defensa",    cost: 1, effectValue: 20,  description: "Bloquea 20 pts de daño rápidamente." },
  { id: 'e3', name: "Barrera de Éter",   type: "defensa",    cost: 2, effectValue: 30,  description: "Levanta un muro que bloquea 30 pts de daño." },
  { id: 'e4', name: "Muro de Piedra",    type: "defensa",    cost: 2, effectValue: 35,  description: "Bloquea 35 pts de daño físico." },
  { id: 'e5', name: "Escudo Abisal",     type: "defensa",    cost: 3, effectValue: 50,  description: "Protección total. Bloquea 50 pts de daño." },
  { id: 'h1', name: "Visión Estratégica",type: "habilidad",  cost: 2, effectValue: 0,   description: "Roba 2 cartas adicionales del mazo." },
  { id: 'h2', name: "Grito de Guerra",   type: "habilidad",  cost: 3, effectValue: 0,   description: "Tu próximo ataque inflige el doble de daño." },
  { id: 'd1', name: "Ira del Rey Caído", type: "definitiva", cost: 7, effectValue: 100, description: "Causa 100 pts de daño letal instantáneo." },
];

export default function TutorialBattle() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("Griff");
  const [mounted, setMounted] = useState(false);

 
  const enemyRef    = useRef(null);
  const playerHudRef = useRef(null);
  const enemyDmgRef  = useRef(null); 
  const playerDmgRef = useRef(null); 

  
  const [step, setStep]               = useState(0);
  const [monsterHp, setMonsterHp]     = useState(100);
  const [playerHp, setPlayerHp]       = useState(50);
  const [playerShield, setPlayerShield] = useState(0);
  const [energy, setEnergy]           = useState(10);
  const [systemMessage, setSystemMessage] = useState("");
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [showImpact, setShowImpact]   = useState(false);

  
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const intervalRef = useRef(null);

  const [hand, setHand] = useState([
    cardDatabase.find(c => c.id === 'a4'),
    cardDatabase.find(c => c.id === 'a1'),
    cardDatabase.find(c => c.id === 'e1'),
    cardDatabase.find(c => c.id === 'e3'),
    cardDatabase.find(c => c.id === 'h1'),
  ]);

  useEffect(() => {
    const storedName = localStorage.getItem("abyssPlayerName");
    if (storedName) setPlayerName(storedName);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);


  const spawnDamageNumber = (ref, value, color = '#f87171') => {
    const el = ref.current;
    if (!el) return;
    const span = document.createElement('span');
    span.textContent = `-${value}`;
    span.style.cssText = `
      position:absolute; top:-10px; left:50%; transform:translateX(-50%);
      color:${color}; font-size:1.6rem; font-weight:900;
      text-shadow:0 0 8px ${color}, 0 2px 4px #000;
      pointer-events:none; white-space:nowrap; z-index:999;
    `;
    el.style.position = 'relative';
    el.appendChild(span);
    span.animate(
      [
        { opacity: 1, transform: 'translateX(-50%) translateY(0px)'   },
        { opacity: 0, transform: 'translateX(-50%) translateY(-50px)' },
      ],
      { duration: 900, easing: 'ease-out', fill: 'forwards' }
    ).onfinish = () => span.remove();
  };

  const shakeElement = (ref) => {
    ref.current?.animate(
      [
        { transform: 'translateX(0px)'   },
        { transform: 'translateX(-12px)' },
        { transform: 'translateX(12px)'  },
        { transform: 'translateX(-8px)'  },
        { transform: 'translateX(8px)'   },
        { transform: 'translateX(-4px)'  },
        { transform: 'translateX(0px)'   },
      ],
      { duration: 400, easing: 'ease-out' }
    );
  };

 
  const hitFlashEnemy = (ref) => {
    ref.current?.animate(
      [
        { filter: 'brightness(1) saturate(1)' },
        { filter: 'brightness(3) saturate(0) sepia(1) hue-rotate(310deg)' },
        { filter: 'brightness(1) saturate(1)' },
      ],
      { duration: 350, easing: 'ease-out' }
    );
  };

 
  const shakePlayer = (ref) => {
    ref.current?.animate(
      [
        { transform: 'translateY(0px)',  filter: 'brightness(1)'   },
        { transform: 'translateY(-6px)', filter: 'brightness(2) hue-rotate(310deg)' },
        { transform: 'translateY(6px)',  filter: 'brightness(1.5)' },
        { transform: 'translateY(-4px)', filter: 'brightness(1)'   },
        { transform: 'translateY(0px)',  filter: 'brightness(1)'   },
      ],
      { duration: 450, easing: 'ease-out' }
    );
  };

  const tutorialSteps = [
    { speaker: "Guía Táctica", text: `¡Atención, ${playerName}! Una Anomalía ha bloqueado el acceso. Tiene 100 HP. Tu Núcleo Vital inicia con 50 HP.`, action: "next" },
    { speaker: "Guía Táctica", text: "Tienes 10 Puntos de Energía. Úsalos sabiamente. Las Habilidades y Definitivas están bloqueadas en este entrenamiento.", action: "next" },
    { speaker: "Guía Táctica", text: "¡Ataca o defiéndete! Juega tus cartas. Cuando termines, haz clic en 'Terminar Turno' para que la anomalía contraataque.", action: "play" },
    { speaker: "Sistema",      text: "¡Anomalía neutralizada! Has dominado el combate táctico. El camino al nivel 1 está abierto.", action: "finish" },
  ];

  const currentStepData = tutorialSteps[step];

  useEffect(() => {
    clearInterval(intervalRef.current);
    setDisplayText("");
    setIsTyping(true);
    let i = 0;
    const fullText = currentStepData.text;
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayText(fullText.slice(0, i));
      if (i >= fullText.length) { clearInterval(intervalRef.current); setIsTyping(false); }
    }, 28);
    return () => clearInterval(intervalRef.current);
  }, [step]); 

  const skipTyping = () => {
    if (isTyping) {
      clearInterval(intervalRef.current);
      setDisplayText(currentStepData.text);
      setIsTyping(false);
    }
  };


  const handlePlayCard = (card, index) => {
    if (step !== 2 || isEnemyTurn) return;
    setSystemMessage("");

    if (card.type === "habilidad" || card.type === "definitiva") {
      setSystemMessage("Mecánica bloqueada en el tutorial. Usa Ataques o Escudos.");
      return;
    }
    if (energy < card.cost) { setSystemMessage("Energía Insuficiente."); return; }

    setEnergy(prev => prev - card.cost);
    const newHand = hand.filter((_, i) => i !== index);

    if (card.type === "ataque") {
      const newHp = Math.max(0, monsterHp - card.effectValue);
      setMonsterHp(newHp);
     
      shakeElement(enemyRef);
      hitFlashEnemy(enemyRef);
      spawnDamageNumber(enemyRef, card.effectValue, '#f87171');
      setShowImpact(true);
      setTimeout(() => setShowImpact(false), 450);
      setHand(newHand);
      if (newHp === 0) setStep(3);
    } else if (card.type === "defensa") {
      setPlayerShield(prev => prev + card.effectValue);
      setSystemMessage(`Escudo activado: +${card.effectValue} Defensa.`);
      setHand(newHand);
    }
  };


  const handleEndTurn = () => {
    if (isEnemyTurn || step !== 2) return;
    setIsEnemyTurn(true);
    setSystemMessage("Turno Enemigo: La anomalía se abalanza sobre ti...");
    setTimeout(() => {
      const enemyDamage = 25;
      const damageTaken = Math.max(0, enemyDamage - playerShield);
      const newHp = Math.max(0, playerHp - damageTaken);

      
      enemyRef.current?.animate(
        [
          { transform: 'translateX(0px)  scale(1)'    },
          { transform: 'translateX(-80px) scale(1.15)' },
          { transform: 'translateX(0px)  scale(1)'    },
        ],
        { duration: 500, easing: 'ease-in-out' }
      );

    
      setTimeout(() => {
        if (damageTaken > 0) {
          shakePlayer(playerHudRef);
          spawnDamageNumber(playerHudRef, damageTaken, '#fb923c');
        }
        setPlayerHp(newHp);
        setPlayerShield(0);
        if (newHp > 0) {
          setSystemMessage(`Recibiste ${damageTaken} de daño. ¡Tu turno, acábala!`);
          setEnergy(10);
          setIsEnemyTurn(false);
          setHand(prev => [...prev, cardDatabase.find(c => c.id === 'a5')]);
        } else {
          setSystemMessage("Tu núcleo fue destruido... (Reiniciando tutorial)");
          setTimeout(() => window.location.reload(), 2000);
        }
      }, 400);
    }, 1100);
  };

  const speakerColor = isEnemyTurn ? 'text-red-400' : 'text-sky-400';

  return (
    <main
      className={`h-screen w-full flex flex-col relative overflow-hidden bg-slate-900 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      onClick={skipTyping}
    >

      <div className="absolute inset-0 z-0">
        <img src="/calabozo.png" className="w-full h-full object-cover opacity-50" alt="Fondo" />
    
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-slate-950/30" />
      </div>


      {showImpact && <div className={styles.impactFlash} />}


      <div className="relative z-10 w-full max-w-6xl mx-auto flex justify-between items-start px-4 md:px-8 pt-6">


        <div className="flex flex-col md:flex-row gap-3">
          <div className={styles.statBox}>
            <p className="text-sky-400 font-bold uppercase tracking-widest text-xs mb-1">Energía</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white">{energy}</span>
              <span className="text-slate-400 font-bold mb-1">/ 10</span>
            </div>
          </div>

          <div ref={playerHudRef} className={`${styles.statBoxGreen} relative`}>
            <p className="text-green-400 font-bold uppercase tracking-widest text-xs mb-1">Núcleo Vital</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white">{playerHp}</span>
              <span className="text-slate-400 font-bold mb-1">/ 50</span>
            </div>
            {playerShield > 0 && (
              <div className="absolute -top-3 -right-3 bg-sky-600 border-2 border-white text-white font-black px-3 py-1 rounded-full shadow-lg text-sm animate-bounce">
                +{playerShield}
              </div>
            )}
          </div>
        </div>


        <div className={`${styles.enemyWrapper} ${monsterHp === 0 ? styles.dead : ''}`}>
          <img
            ref={enemyRef}
            src="/enemigos/FR_071_BabyDoll.png"   
            alt="Anomalía"
            className={styles.enemyImg}
            onError={(e) => {
              
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          
          <div
            style={{ display: 'none' }}
            className="w-32 h-32 rounded-full bg-red-950/50 border-4 border-red-900 flex items-center justify-center shadow-[0_0_30px_rgba(153,27,27,0.5)] animate-pulse"
          >
            <span className="text-red-500 font-bold tracking-widest uppercase text-xs text-center">Anomalía</span>
          </div>

        
          <div className={styles.hpTrack}>
            <div className={styles.hpFill} style={{ width: `${(monsterHp / 100) * 100}%` }} />
          </div>
          <p className="text-white text-xs font-bold tracking-wider">HP: {monsterHp} / 100</p>
        </div>
      </div>


      <div className="flex-1" />


      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 md:px-8">
        {step === 2 && (
          <div className="flex justify-end mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleEndTurn(); }}
              disabled={isEnemyTurn}
              className={`font-bold py-2 px-7 rounded uppercase tracking-widest text-sm ${isEnemyTurn ? styles.btnEndTurnDisabled : styles.btnEndTurn}`}
            >
              Terminar Turno
            </button>
          </div>
        )}

        <div className="flex gap-3 flex-wrap justify-center mb-4">
          {hand.map((card, index) => {
            const isUsable = step === 2 && !isEnemyTurn && (card.type === "ataque" || card.type === "defensa");
            return (
              <div
                key={index}
                onClick={(e) => { e.stopPropagation(); handlePlayCard(card, index); }}
                className={`transition-all duration-300 ${isUsable ? 'hover:-translate-y-4 cursor-pointer' : styles.dimmedCard}`}
              >
                <GameCard
                  name={card.name}
                  type={card.type}
                  cost={card.cost}
                  effectValue={card.effectValue}
                  description={card.description}
                />
              </div>
            );
          })}
        </div>
      </div>


      <div
        className={`relative z-30 w-full max-w-5xl mx-auto px-4 md:px-8 pb-4 md:pb-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={isEnemyTurn ? styles.dialogBoxEnemy : styles.dialogBox}
             style={{ padding: '24px 32px 28px 32px', position: 'relative' }}>

          {/* Nameplate */}
          <div className={`absolute -top-5 left-8 px-6 py-1 ${isEnemyTurn ? styles.namePlateEnemy : styles.namePlate}`}>
            <span className={`${fuenteHistoria.className} font-bold text-lg tracking-widest ${speakerColor} drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]`}>
              {currentStepData.speaker}
            </span>
          </div>

          <p className="text-slate-200 text-xl md:text-2xl leading-relaxed mt-3 mb-4 min-h-14">
            {displayText}
            {isTyping && <span className={styles.cursor}>▍</span>}
          </p>


          {systemMessage && (
            <p className={`font-bold text-sm mb-3 ${isEnemyTurn ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
              {systemMessage}
            </p>
          )}


          {!isTyping && (
            <div className="flex justify-end gap-3">
              {currentStepData.action === "next" && (
                <button
                  onClick={(e) => { e.stopPropagation(); setStep(step + 1); }}
                  className="bg-slate-800 text-sky-300 font-bold py-2 px-6 rounded border border-sky-700 uppercase tracking-wider text-sm hover:bg-slate-700 transition-all"
                >
                  Entendido ▸
                </button>
              )}
              {currentStepData.action === "finish" && (
                <button
                  onClick={(e) => { e.stopPropagation(); router.push('/grimorio'); }}
                  className="bg-sky-900 text-sky-100 font-bold py-2 px-6 rounded border border-sky-700 uppercase tracking-wider text-sm hover:bg-sky-800 transition-all"
                >
                  Continuar Historia ▸
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
