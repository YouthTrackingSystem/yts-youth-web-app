import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("YTS Youth Portal"),
  NEXT_PUBLIC_PWA_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true")
});

export const env = clientEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_PWA_ENABLED: process.env.NEXT_PUBLIC_PWA_ENABLED
});
