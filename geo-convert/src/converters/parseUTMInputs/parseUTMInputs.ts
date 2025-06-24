import { z } from "zod";
import type { UTMCoordinate } from "..";

const schema = z
  .object({
    easting: z.preprocess(
      (v) => parseFloat(String(v).trim()),
      z
        .number()
        .refine((val) => !Number.isNaN(val), { message: "Invalid easting" })
    ),
    northing: z.preprocess(
      (v) => parseFloat(String(v).trim()),
      z
        .number()
        .refine((val) => !Number.isNaN(val), { message: "Invalid northing" })
    ),
    zone: z.preprocess(
      (v) => parseInt(String(v).trim(), 10),
      z
        .number()
        .int()
        .min(1)
        .max(60)
        .refine((val) => !Number.isNaN(val), { message: "Invalid zone" })
    ),
    hemisphere: z.preprocess(
      (v) => String(v).trim().toUpperCase(),
      z.enum(["N", "S"])
    ),
  })
  .transform((val) => val as UTMCoordinate);

export function parseUTMInputs(
  easting: string,
  northing: string,
  zone: string,
  hemisphere: string
): UTMCoordinate | null {
  const result = schema.safeParse({ easting, northing, zone, hemisphere });
  if (!result.success) {
    return null;
  }
  return result.data;
}
