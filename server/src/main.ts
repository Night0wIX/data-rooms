import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module.js";
import { env } from "@/core/config/env/index.js";
import { HttpAdapterHost } from "@nestjs/core";
import { GlobalExceptionFilter } from "@/core/filter/index.js";
import { createValidationPipe } from "@/core/validation/index.js";
import { API_PREFIX } from "@/shared/constants/index.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  const globalFilter = new GlobalExceptionFilter(httpAdapterHost);
  const validationPipe = createValidationPipe();

  app.enableCors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(globalFilter);
  app.useGlobalPipes(validationPipe);

  await app.listen(env.PORT);
}

bootstrap();
