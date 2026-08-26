import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  app.enableShutdownHooks();

  await app.listen(env.port, "0.0.0.0");

  const url = await app.getUrl();
  console.warn(`Vera API listening at ${url} (env=${env.env}, version=${env.version})`);
}

void bootstrap();
