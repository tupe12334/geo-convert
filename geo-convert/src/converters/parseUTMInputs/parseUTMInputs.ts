import type { UTMCoordinate } from "..";

export function parseUTMInputs(
  easting: string,
  northing: string,
  zone: string,
  hemisphere: string
): UTMCoordinate | null {
  const eastingNum = parseFloat(easting.trim());
  const northingNum = parseFloat(northing.trim());
  const zoneNum = parseInt(zone.trim());
  const hemisphereStr = hemisphere.trim().toUpperCase();

  if (
    isNaN(eastingNum) ||
    isNaN(northingNum) ||
    isNaN(zoneNum) ||
    (hemisphereStr !== "N" && hemisphereStr !== "S") ||
    zoneNum < 1 ||
    zoneNum > 60
  ) {
    return null;
  }

  return {
    easting: eastingNum,
    northing: northingNum,
    zone: zoneNum,
    hemisphere: hemisphereStr as "N" | "S",
  };
}
