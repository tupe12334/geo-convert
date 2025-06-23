import proj4 from "proj4";
import type { UTMCoordinate, WGS84Coordinate } from "..";

export function convertWGS84toUTM(
  wgs84: WGS84Coordinate,
  targetZone?: number
): UTMCoordinate {
  // Determine UTM zone if not provided
  const zone = targetZone || Math.floor((wgs84.longitude + 180) / 6) + 1;

  // Determine hemisphere
  const hemisphere: "N" | "S" = wgs84.latitude >= 0 ? "N" : "S";

  // Define WGS84 projection
  const wgs84Projection = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

  // Define the UTM projection string
  const utmProjection = `+proj=utm +zone=${zone}${
    hemisphere === "S" ? " +south" : ""
  } +ellps=WGS84 +datum=WGS84 +units=m +no_defs`;

  // Convert WGS84 to UTM
  const [easting, northing] = proj4(wgs84Projection, utmProjection, [
    wgs84.longitude,
    wgs84.latitude,
  ]);

  return { easting, northing, zone, hemisphere };
}