import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  PORT: z.number().default(3333),
});
