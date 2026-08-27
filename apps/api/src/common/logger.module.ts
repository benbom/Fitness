import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { LoggerModule as PinoLoggerModule } from "nestjs-pino";

import { env } from "../config/env";

import { REDACT_CENSOR, REDACT_PATHS } from "./redaction";

const REQUEST_ID_HEADER = "x-request-id";

/**
 * Central Pino-baserad logger för hela monoliten.
 *
 * Tre garantier:
 *   1. Klass 1-fält (se ADR-004 + `redaction.ts`) censoreras
 *      innan de når stdout eller vidare pipelines.
 *   2. Varje inkommande request får (eller behåller) ett
 *      `x-request-id` som propageras i alla efterföljande
 *      loggrader via Pinos req-serializer.
 *   3. Loggnivå styrs av `LOG_LEVEL`-env genom `env`-modulen.
 *
 * I `development` byter vi till pino-pretty för läsbar output.
 * I `test` slår vi av logging helt så testkörningar inte skräpar
 * ner terminalen med brus.
 */
export const LoggerModule = PinoLoggerModule.forRoot({
  pinoHttp: {
    level: env.env === "test" ? "silent" : env.logLevel,
    redact: {
      paths: [...REDACT_PATHS],
      censor: REDACT_CENSOR,
      remove: false,
    },
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
      const existing = req.headers[REQUEST_ID_HEADER];
      const id = typeof existing === "string" && existing.length > 0 ? existing : randomUUID();
      res.setHeader(REQUEST_ID_HEADER, id);
      return id;
    },
    customLogLevel: (_req, res, err) => {
      if (err) return "error";
      const status = res.statusCode ?? 0;
      if (status >= 500) return "error";
      if (status >= 400) return "warn";
      return "info";
    },
    autoLogging: {
      ignore: (req) => req.url === "/health/live" || req.url === "/health/ready",
    },
    transport:
      env.env === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              singleLine: false,
              translateTime: "SYS:HH:MM:ss.l",
              ignore: "pid,hostname",
            },
          }
        : undefined,
    base: {
      env: env.env,
      version: env.version,
      gitSha: env.gitSha,
    },
  },
});
