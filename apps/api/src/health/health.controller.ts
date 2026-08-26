import { Controller, Get } from "@nestjs/common";

import { env } from "../config/env";

/**
 * M0-13: liveness-endpoint returnerar version och git-sha.
 * M0-18 lägger till /health/ready som verifierar Postgres, Redis och Ory.
 */
@Controller("health")
export class HealthController {
  @Get("live")
  live(): LivenessResponse {
    return {
      status: "ok",
      version: env.version,
      gitSha: env.gitSha,
      env: env.env,
      timestamp: new Date().toISOString(),
    };
  }
}

export interface LivenessResponse {
  status: "ok";
  version: string;
  gitSha: string;
  env: string;
  timestamp: string;
}
