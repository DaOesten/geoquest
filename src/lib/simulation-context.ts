"use client";

import { createContext, useContext } from "react";

/**
 * Markiert Player-Bausteine, die in der Quest-Simulation auf /about laufen
 * (PROJ-13, Refinement 13).
 *
 * Dort darf kein Bedienelement in die echte App führen: Die Simulation läuft
 * in einem iframe, ein Link nach /play oder das Burger-Menü würden darin die
 * richtige App öffnen. Als Kontext statt als Prop, weil das Menü tief in
 * `AppHeader` sitzt und sonst durch jede Screen-Komponente gereicht werden
 * müsste. Ohne Provider ist der Wert `false` — der echte Player merkt nichts.
 */
export const SimulationContext = createContext(false);

export function useInSimulation() {
  return useContext(SimulationContext);
}
