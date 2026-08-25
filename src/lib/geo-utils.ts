const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = (lat2 - lat1) * DEG;
  const dLng = (lng2 - lng1) * DEG;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLng = (lng2 - lng1) * DEG;
  const y = Math.sin(dLng) * Math.cos(lat2 * DEG);
  const x =
    Math.cos(lat1 * DEG) * Math.sin(lat2 * DEG) -
    Math.sin(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.cos(dLng);
  return ((Math.atan2(y, x) * RAD + 360) % 360);
}

export function headingFromPositions(
  prevLat: number,
  prevLng: number,
  currLat: number,
  currLng: number
): number | null {
  const dist = haversine(prevLat, prevLng, currLat, currLng);
  if (dist < 2) return null;
  return bearing(prevLat, prevLng, currLat, currLng);
}

export type DistanceColor = "red" | "yellow" | "green";

export function getDistanceColor(meters: number): DistanceColor {
  if (meters > 200) return "red";
  if (meters > 50) return "yellow";
  return "green";
}
