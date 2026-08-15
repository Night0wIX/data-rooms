import { PrismaPg } from "@prisma/adapter-pg";
import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@/generated/prisma/client.js";
import { env } from "@/core/config/env/index.js";
import { DATABASE_DEV_LOG_LEVELS, DATABASE_PROD_LOG_LEVELS } from "./database.constants.js";
import type { DatabaseLogLevel } from "./database.types.js";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    const log: DatabaseLogLevel[] =
      env.NODE_ENV === "production" ? [...DATABASE_PROD_LOG_LEVELS] : [...DATABASE_DEV_LOG_LEVELS];
    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

    super({ adapter, log });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log("Database connected");
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log("Database disconnected");
  }
}
