import "./globals.css";

export const metadata = {
  title: "Abyss Tactics",
  description: "Un juego de cartas táctico y rol estratégico.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-black text-slate-300 antialiased">
        {children}
      </body>
    </html>
  );
}