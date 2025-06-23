import { z } from "zod";

/**
 * Retrieve the phone number from Vite environment variables.
 *
 * @param env - optional environment object for testing
 * @returns validated phone number
 */
export const getPhone = (env: unknown = import.meta.env): string => {
  const schema = z.object({ VITE_PHONE: z.string() });
  const parsed = schema.parse(env);
  return parsed.VITE_PHONE;
};
