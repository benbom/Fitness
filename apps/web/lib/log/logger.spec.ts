import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { _resetLoggerLevelForTest, log } from "./logger";

interface CapturedLine {
  stream: "stdout" | "stderr" | "warn";
  parsed: Record<string, unknown>;
  raw: string;
}

function captureLogs(): { lines: CapturedLine[]; restore: () => void } {
  const lines: CapturedLine[] = [];
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  const push = (stream: CapturedLine["stream"]) => (arg: unknown) => {
    const raw = typeof arg === "string" ? arg : JSON.stringify(arg);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      parsed = { __unparsed__: raw };
    }
    lines.push({ stream, parsed, raw });
  };

  console.log = push("stdout");
  console.warn = push("warn");
  console.error = push("stderr");

  return {
    lines,
    restore: () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
    },
  };
}

describe("structured logger", () => {
  const originalLevel = process.env["LOG_LEVEL"];

  beforeEach(() => {
    delete process.env["LOG_LEVEL"];
    _resetLoggerLevelForTest();
  });

  afterEach(() => {
    if (originalLevel === undefined) delete process.env["LOG_LEVEL"];
    else process.env["LOG_LEVEL"] = originalLevel;
    vi.unstubAllEnvs();
    _resetLoggerLevelForTest();
  });

  it("skriver en JSON-rad per anrop med level+ts+msg", () => {
    const cap = captureLogs();
    log.info("something happened", { userId: "u-1" });
    cap.restore();

    expect(cap.lines).toHaveLength(1);
    const line = cap.lines[0]!;
    expect(line.stream).toBe("stdout");
    expect(line.parsed.level).toBe("info");
    expect(line.parsed.msg).toBe("something happened");
    expect(line.parsed.userId).toBe("u-1");
    expect(typeof line.parsed.ts).toBe("string");
    // ts ska vara ISO-8601
    expect(new Date(line.parsed.ts as string).toISOString()).toBe(line.parsed.ts);
  });

  it("warn skrivs till stderr-strömmen (Vercel klassificerar det som warning)", () => {
    const cap = captureLogs();
    log.warn("careful");
    cap.restore();
    expect(cap.lines[0]!.stream).toBe("warn");
    expect(cap.lines[0]!.parsed.level).toBe("warn");
  });

  it("error skrivs till stderr", () => {
    const cap = captureLogs();
    log.error("boom");
    cap.restore();
    expect(cap.lines[0]!.stream).toBe("stderr");
    expect(cap.lines[0]!.parsed.level).toBe("error");
  });

  it("REDACTAR Klass 1-fält oavsett var i context de sitter", () => {
    const cap = captureLogs();
    log.info("saving cycle", {
      userId: "u-1",
      cycleEntry: { date: "2026-01-01", flow: "medium" },
      symptoms: ["cramps"],
      lifeStage: "perimenopause",
      pregnancyStatus: "none",
      nested: { flow: "heavy" },
    });
    cap.restore();

    const p = cap.lines[0]!.parsed;
    expect(p.userId).toBe("u-1"); // legitimt fält passerar
    expect(p.cycleEntry).toBe("[REDACTED]");
    expect(p.symptoms).toBe("[REDACTED]");
    expect(p.lifeStage).toBe("[REDACTED]");
    expect(p.pregnancyStatus).toBe("[REDACTED]");
    // Djupt nested flow-fält scrubbas också
    expect((p.nested as { flow: string }).flow).toBe("[REDACTED]");
  });

  it("Error-objekt normaliseras till { name, message, stack }", () => {
    const cap = captureLogs();
    const err = new Error("kapow");
    log.error("prisma failed", { err });
    cap.restore();

    const p = cap.lines[0]!.parsed;
    const errField = p.err as { name: string; message: string; stack: string };
    expect(errField.message).toBe("kapow");
    expect(errField.name).toBe("Error");
    expect(typeof errField.stack).toBe("string");
  });

  it("respekterar LOG_LEVEL=warn — debug och info skippas", () => {
    process.env["LOG_LEVEL"] = "warn";
    _resetLoggerLevelForTest();

    const cap = captureLogs();
    log.debug("nope");
    log.info("nope");
    log.warn("yes");
    log.error("yes");
    cap.restore();

    expect(cap.lines).toHaveLength(2);
    expect(cap.lines[0]!.parsed.level).toBe("warn");
    expect(cap.lines[1]!.parsed.level).toBe("error");
  });

  it("default i produktion är info (debug skippas)", () => {
    vi.stubEnv("NODE_ENV", "production");
    _resetLoggerLevelForTest();

    const cap = captureLogs();
    log.debug("nope");
    log.info("yes");
    cap.restore();

    expect(cap.lines).toHaveLength(1);
    expect(cap.lines[0]!.parsed.level).toBe("info");
  });

  it("child logger inkluderar bunden kontext i alla rader", () => {
    const requestLogger = log.child({ requestId: "req-abc", userId: "u-1" });

    const cap = captureLogs();
    requestLogger.info("first");
    requestLogger.warn("second");
    cap.restore();

    for (const line of cap.lines) {
      expect(line.parsed.requestId).toBe("req-abc");
      expect(line.parsed.userId).toBe("u-1");
    }
  });

  it("call-context overridar child-bunden kontext (mer specifikt vinner)", () => {
    const child = log.child({ userId: "bound" });
    const cap = captureLogs();
    child.info("override", { userId: "call" });
    cap.restore();
    expect(cap.lines[0]!.parsed.userId).toBe("call");
  });

  it("okänt LOG_LEVEL faller tillbaka till dev-default", () => {
    process.env["LOG_LEVEL"] = "nonsense";
    _resetLoggerLevelForTest();
    const cap = captureLogs();
    log.debug("visible in dev");
    cap.restore();
    expect(cap.lines.length).toBeGreaterThan(0);
  });
});
