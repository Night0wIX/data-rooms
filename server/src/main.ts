import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module.js";
import { env } from "@/core/config/env/index.js";
import { HttpAdapterHost } from "@nestjs/core";
import { GlobalExceptionFilter } from "@/core/filter/index.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));

  await app.listen(env.PORT);
}

bootstrap();
