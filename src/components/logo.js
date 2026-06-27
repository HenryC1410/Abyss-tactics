export default function Logo({ className = "w-32 h-32" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Efecto de brillo de fondo con Tailwind */}
      <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute w-2/3 h-2/3 bg-purple-600/30 rounded-full blur-2xl"></div>

      {/* Vector SVG del Logo */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]"
      >
        {/* Rombo Exterior (El Abismo) */}
        <path
          d="M50 5L90 50L50 95L10 50L50 5Z"
          stroke="url(#abyssGradient)"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Rombo Interior (El Núcleo) */}
        <path
          d="M50 20L76 50L50 80L24 50L50 20Z"
          fill="url(#coreGradient)"
          opacity="0.8"
        />

        {/* Grieta / Destello Táctico (Corte de Energía) */}
        <path
          d="M20 65L80 35"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_#ffffff]"
        />
        <path
          d="M15 67.5L85 32.5"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Definición de Degradados de Color */}
        <defs>
          <linearGradient id="abyssGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" /> {/* Rojo Neón */}
            <stop offset="50%" stopColor="#7c3aed" /> {/* Violeta */}
            <stop offset="100%" stopColor="#0f172a" /> {/* Oscuro */}
          </linearGradient>

          <linearGradient id="coreGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}