import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  await app.listen(env.port, "0.0.0.0");

  const url = await app.getUrl();
  app
    .get(Logger)
    .log(
      { event: "api.started", url, port: env.port, version: env.version, gitSha: env.gitSha },
      "Vera API startad",
    );
}

void bootstrap();
