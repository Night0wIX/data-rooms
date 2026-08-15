import { envSchema } from "./env.schema.js";
import { Env } from "./env.types.js";

const parsed = envSchema.parse(process.env);

export const env: Env = Object.freeze(parsed);
