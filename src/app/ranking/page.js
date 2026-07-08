"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import localFont from 'next/font/local';

const miFuentePersonalizada = localFont({
  src: '../fonts/IcelandWinterstorm.otf', 
  display: 'swap',
});

export default function RankingPage() {
  const router = useRouter();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // CONEXIÓN A INDEXEDDB Y EXTRACCIÓN DE DATOS
  // ==========================================
  useEffect(() => {
    if (typeof window === "undefined" || !window.indexedDB) {
      setLoading(false);
      return;
    }

    const request = indexedDB.open("AbyssRankings", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      
      // Si la tabla no existe aún
      if (!db.objectStoreNames.contains("scores")) {
        setLoading(false);
        return;
      }

      const transaction = db.transaction(["scores"], "readonly");
      const store = transaction.objectStore("scores");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        let data = getAllRequest.result;
        
        // LÓGICA DE ORDENAMIENTO (RANKING)
        // 1. Mayor nivel alcanzado va primero.
        // 2. Si empatan en nivel, el menor tiempo va primero.
        data.sort((a, b) => {
          if (b.nivel !== a.nivel) {
            return b.nivel - a.nivel; 
          }
          return a.tiempo - b.tiempo;
        });

        setScores(data);
        setLoading(false);
      };
    };

    request.onerror = () => {
      console.error("Error al acceder al Ranking en IndexedDB");
      setLoading(false);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Fondo oscuro y místico */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className={`${miFuentePersonalizada.className} text-5xl md:text-6xl text-white tracking-widest text-center mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`}>
          Salón de los Caídos
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest mb-10 text-sm md:text-base text-center">
          Registros del Grimorio Táctico
        </p>

        {/* CONTENEDOR DE LA TABLA */}
        <div className="w-full bg-slate-900/80 border border-slate-700 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm mb-8">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-700">
                  <th className="py-4 px-6 text-sky-500 font-bold uppercase tracking-wider text-sm">Rango</th>
                  <th className="py-4 px-6 text-sky-500 font-bold uppercase tracking-wider text-sm">Cazador</th>
                  <th className="py-4 px-6 text-sky-500 font-bold uppercase tracking-wider text-sm text-center">Nivel</th>
                  <th className="py-4 px-6 text-sky-500 font-bold uppercase tracking-wider text-sm text-center">Tiempo (s)</th>
                  <th className="py-4 px-6 text-sky-500 font-bold uppercase tracking-wider text-sm text-center">Estado</th>
                  <th className="py-4 px-6 text-yellow-500 font-bold uppercase tracking-wider text-sm text-center">Logro</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500 font-bold animate-pulse">
                      Consultando archivos del Abismo...
                    </td>
                  </tr>
                ) : scores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500 font-bold">
                      No hay registros. Sé el primero en desafiar la mazmorra.
                    </td>
                  </tr>
                ) : (
                  scores.map((score, index) => (
                    <tr 
                      key={score.id} 
                      className={`border-b border-slate-800 transition-colors hover:bg-slate-800/50 ${index === 0 ? 'bg-sky-950/20' : ''}`}
                    >
                      <td className="py-4 px-6 text-slate-300 font-bold">
                        #{index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-bold tracking-wider ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                          {score.nombre}
                        </span>
                        <span className="block text-xs text-slate-500 mt-1">{score.fecha}</span>
                      </td>
                      <td className="py-4 px-6 text-center text-white font-black text-lg">
                        {score.nivel}
                      </td>
                      <td className="py-4 px-6 text-center text-slate-300 font-mono">
                        {score.tiempo}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border ${score.resultado === 'Victoria' ? 'bg-green-950/50 text-green-400 border-green-800' : 'bg-red-950/50 text-red-400 border-red-800'}`}>
                          {score.resultado}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-yellow-400 font-bold text-sm tracking-wide">
                        {score.logro ? score.logro : "---"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => router.push('/')}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-10 rounded border border-slate-600 uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-1"
        >
          Volver al Inicio
        </button>

      </div>
    </main>
  );
}