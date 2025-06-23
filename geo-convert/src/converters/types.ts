export interface UTMCoordinate {
  easting: number;
  northing: number;
  zone: number;
  hemisphere: "N" | "S";
}

export interface WGS84Coordinate {
  latitude: number;
  longitude: number;
}
