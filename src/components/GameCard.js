"use client";

export default function GameCard({ name, type, cost, effectValue, description }) {
  // Colores dinámicos basados en el tipo de carta (usando Tailwind)
  const typeColors = {
    ataque: "bg-red-950 border-red-500 text-red-100",
    defensa: "bg-blue-950 border-blue-500 text-blue-100",
    curacion: "bg-emerald-950 border-emerald-500 text-emerald-100",
    especial: "bg-purple-950 border-purple-500 text-purple-100"
  };

  // Si no se le pasa un tipo válido, usa gris por defecto
  const colorClass = typeColors[type] || "bg-gray-800 border-gray-500 text-gray-100";

  return (
    <div 
      className={`w-48 h-72 rounded-xl border-2 p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] select-none ${colorClass}`}
    >
      {/* Cabecera: Tipo y Costo de Energía */}
      <div className="flex justify-between items-start border-b border-white/20 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{type}</span>
        <div className="bg-black/60 rounded-full w-7 h-7 flex items-center justify-center font-mono text-sm font-bold border border-white/30 shadow-inner">
          {cost}
        </div>
      </div>

      {/* Centro: Nombre y Valor del Efecto */}
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <h3 className="font-bold text-lg leading-tight mb-3 drop-shadow-md">{name}</h3>
        <span className="text-4xl font-black drop-shadow-lg">
          {type === 'curacion' || type === 'defensa' ? '+' : '-'}{effectValue}
        </span>
      </div>

      {/* Pie: Descripción */}
      <div className="text-xs text-center bg-black/40 p-2 rounded-lg border border-white/10 leading-snug">
        {description}
      </div>
    </div>
  );
}