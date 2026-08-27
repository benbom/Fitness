import { Writable } from "node:stream";

import pino, { type Logger } from "pino";

import { KLASS_1_FIELD_NAMES, REDACT_CENSOR, REDACT_PATHS } from "./redaction";

interface CapturedLine {
  raw: string;
  parsed: Record<string, unknown>;
}

function makeLogger(): { logger: Logger; capture: () => CapturedLine } {
  let captured = "";
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      captured += chunk.toString();
      callback();
    },
  });
  const logger = pino(
    {
      redact: { paths: [...REDACT_PATHS], censor: REDACT_CENSOR },
    },
    stream,
  );
  return {
    logger,
    capture: () => ({ raw: captured, parsed: JSON.parse(captured) as Record<string, unknown> }),
  };
}

describe("Klass 1-redaktion", () => {
  it.each(KLASS_1_FIELD_NAMES.map((f) => [f]))("censorerar top-level %s", (field: string) => {
    const { logger, capture } = makeLogger();
    logger.info({ [field]: "hemligt värde" }, "test");
    const { raw, parsed } = capture();

    expect(parsed[field]).toBe(REDACT_CENSOR);
    expect(raw).not.toContain("hemligt värde");
  });

  it("censorerar nested cycleEntry på nivå 2", () => {
    const { logger, capture } = makeLogger();
    logger.info({ user: { cycleEntry: { phase: "menstrual", flow: "heavy" } } }, "test");
    const { raw, parsed } = capture();

    const user = parsed["user"] as Record<string, unknown>;
    expect(user["cycleEntry"]).toBe(REDACT_CENSOR);
    expect(raw).not.toContain("menstrual");
    expect(raw).not.toContain("heavy");
  });

  it("censorerar symptoms på nivå 3", () => {
    const { logger, capture } = makeLogger();
    logger.info({ context: { user: { symptoms: ["cramps", "fatigue"] } } }, "test");
    const { raw, parsed } = capture();

    const context = parsed["context"] as Record<string, Record<string, unknown>>;
    expect(context["user"]?.["symptoms"]).toBe(REDACT_CENSOR);
    expect(raw).not.toContain("cramps");
    expect(raw).not.toContain("fatigue");
  });

  it("censorerar fält i req.body men bibehåller req.method", () => {
    const { logger, capture } = makeLogger();
    logger.info(
      {
        req: {
          method: "POST",
          url: "/cycle/log",
          body: { symptoms: ["cramps"], userId: "u-123" },
        },
      },
      "inkommande",
    );
    const { raw, parsed } = capture();

    const req = parsed["req"] as Record<string, unknown>;
    const body = req["body"] as Record<string, unknown>;
    expect(body["symptoms"]).toBe(REDACT_CENSOR);
    expect(body["userId"]).toBe("u-123");
    expect(req["method"]).toBe("POST");
    expect(raw).not.toContain("cramps");
  });

  it("bibehåller icke-känsliga syskonfält bredvid censorering", () => {
    const { logger, capture } = makeLogger();
    logger.info({ userId: "u-abc", cycleEntry: { phase: "luteal" }, action: "log" }, "test");
    const { parsed } = capture();

    expect(parsed["userId"]).toBe("u-abc");
    expect(parsed["cycleEntry"]).toBe(REDACT_CENSOR);
    expect(parsed["action"]).toBe("log");
  });

  it("censorerar båda camelCase och snake_case-varianten", () => {
    const { logger, capture } = makeLogger();
    logger.info({ lifeStage: "postpartum", life_stage: "postpartum" }, "matcha båda konventioner");
    const { parsed } = capture();

    expect(parsed["lifeStage"]).toBe(REDACT_CENSOR);
    expect(parsed["life_stage"]).toBe(REDACT_CENSOR);
  });
});
