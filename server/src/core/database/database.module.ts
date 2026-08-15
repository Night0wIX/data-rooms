import { Global, Module } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";

// Global: domain modules inject DatabaseService without importing this module.
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}