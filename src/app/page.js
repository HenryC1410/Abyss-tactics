import GameCard from "@/components/GameCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
      {/* Título del Juego */}
      <h1 className="text-5xl font-black text-white mb-2 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
        Abyss Tactics
      </h1>
      <p className="text-slate-400 mb-12 uppercase tracking-widest text-sm">Arena de Batalla</p>
      
      {/* Contenedor de las cartas (Simulando la mano del jugador) */}
      <div className="flex gap-4 flex-wrap justify-center">
        <GameCard 
          name="Golpe Sombrío" 
          type="ataque" 
          cost={1} 
          effectValue={15} 
          description="Causa 15 puntos de daño directo a la anomalía."
        />
        
        <GameCard 
          name="Égida Abisal" 
          type="defensa" 
          cost={2} 
          effectValue={20} 
          description="Bloquea 20 puntos de daño durante este turno."
        />
        
        <GameCard 
          name="Poción de Éter" 
          type="curacion" 
          cost={1} 
          effectValue={25} 
          description="Restaura 25 puntos de salud de tu núcleo."
        />

        <GameCard 
          name="Fuego Fatuo" 
          type="especial" 
          cost={3} 
          effectValue={40} 
          description="Ataque crítico devastador e imbloqueable."
        />
      </div>
    </main>
  );
}