// Geographic center of Germany — default map view when the quest has no
// positioned station yet (PROJ-7 spec, Tech Design "Karten-Verhalten").
// Split out from station-map.tsx so importing these plain constants never
// pulls in `leaflet` (which touches `window` at import time and crashes SSR).
export const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];
export const GERMANY_ZOOM = 6;
export const STATION_ZOOM = 16;
