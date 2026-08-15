import type { PrismaClient } from "@/generated/prisma/client.js";
import type { DATABASE_DEV_LOG_LEVELS, DATABASE_PROD_LOG_LEVELS } from "./database.constants.js";

export type DatabaseLogLevel =
  | (typeof DATABASE_DEV_LOG_LEVELS)[number]
  | (typeof DATABASE_PROD_LOG_LEVELS)[number];

export type DatabaseClient = PrismaClient;
