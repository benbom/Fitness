import { Module } from "@nestjs/common";

import { LoggerModule } from "./common/logger.module";
import { HealthModule } from "./health/health.module";
import { BillingModule } from "./modules/billing/billing.module";
import { IdentityModule } from "./modules/identity/identity.module";
import { ProfileModule } from "./modules/profile/profile.module";

/**
 * Root application module.
 *
 * Modulordning speglar bounded contexts från systemdesign §03.
 * M0 hyser bara Identity (C-01), Profile (C-02) och Billing (C-11) — övriga
 * contexts läggs till i respektive milsten.
 *
 * LoggerModule laddas först så att alla efterföljande moduler kan injicera
 * `PinoLogger` eller använda den globala Nest-loggern.
 */
@Module({
  imports: [LoggerModule, HealthModule, IdentityModule, ProfileModule, BillingModule],
})
export class AppModule {}
