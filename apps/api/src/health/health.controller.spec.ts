import { Test, type TestingModule } from "@nestjs/testing";

import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe("GET /health/live", () => {
    it("returnerar status ok", () => {
      const result = controller.live();
      expect(result.status).toBe("ok");
    });

    it("inkluderar version, git-sha, env och timestamp", () => {
      const result = controller.live();
      expect(result).toHaveProperty("version");
      expect(result).toHaveProperty("gitSha");
      expect(result).toHaveProperty("env");
      expect(result).toHaveProperty("timestamp");
    });

    it("timestamp är giltig ISO 8601", () => {
      const result = controller.live();
      expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
    });
  });
});
