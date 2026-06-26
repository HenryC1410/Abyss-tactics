# Abyss Tactics

Abyss Tactics es un prototipo de juego de rol (RPG) y estrategia de cartas por turnos desarrollado en la web. El jugador asume el rol de un estratega que debe gestionar su energía y puntos de salud para neutralizar anomalías (monstruos) utilizando un mazo de cartas tácticas.

Este proyecto fue desarrollado como práctica de la materia de Desarrollo Web I - 2026(1).

## Características Principales

- **Desarrollo de Interfaces (UI/UX):** Interfaz gráfica interactiva y responsiva construida con el framework **Next.js (React)** y estilizada con **Tailwind CSS**.
- **Almacenamiento Local:** 
  - Uso de `localStorage` para el guardado de progreso rápido (nivel actual, racha de victorias, configuración).
  - Uso de `IndexedDB` para la persistencia del inventario de cartas y datos estructurados del jugador.
- **Despliegue Continuo (CI/CD):** El proyecto está publicado en un hosting gratuito y se actualiza progresivamente mediante control de versiones.

## Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Estilos:** Tailwind CSS
- **Despliegue:** [Vercel](https://vercel.com)
- **Control de Versiones:** Git / GitHub

## Instalación y Uso Local

Si deseas correr este proyecto en tu entorno local, sigue estos pasos:

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/HenryC1410/Abyss-tactics.git](https://github.com/HenryC1410/Abyss-tactics.git)