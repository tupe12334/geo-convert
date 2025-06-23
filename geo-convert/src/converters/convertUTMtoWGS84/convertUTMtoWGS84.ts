import proj4 from "proj4";
import type { UTMCoordinate, WGS84Coordinate } from "..";

export function convertUTMtoWGS84(utm: UTMCoordinate): WGS84Coordinate {
  // Define the UTM projection string
  const utmProjection = `+proj=utm +zone=${utm.zone}${
    utm.hemisphere === "S" ? " +south" : ""
  } +ellps=WGS84 +datum=WGS84 +units=m +no_defs`;

  // Define WGS84 projection
  const wgs84Projection = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

  // Convert UTM to WGS84
  const [longitude, latitude] = proj4(utmProjection, wgs84Projection, [
    utm.easting,
    utm.northing,
  ]);

  return { latitude, longitude };
}