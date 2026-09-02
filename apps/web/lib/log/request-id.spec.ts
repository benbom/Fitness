import { beforeEach, describe, expect, it, vi } from "vitest";

const { headersMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: () => headersMock(),
}));

import { getRequestId } from "./request-id";

describe("getRequestId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returnerar x-request-id om det finns (klient/proxy explicit)", async () => {
    headersMock.mockReturnValue({
      get: (name: string) => (name === "x-request-id" ? "req-from-client" : null),
    });
    expect(await getRequestId()).toBe("req-from-client");
  });

  it("fallar tillbaka till x-vercel-id om x-request-id saknas", async () => {
    headersMock.mockReturnValue({
      get: (name: string) => (name === "x-vercel-id" ? "iad1::vercel-abc" : null),
    });
    expect(await getRequestId()).toBe("iad1::vercel-abc");
  });

  it("prioriterar x-request-id framför x-vercel-id om båda finns", async () => {
    headersMock.mockReturnValue({
      get: (name: string) => {
        if (name === "x-request-id") return "explicit";
        if (name === "x-vercel-id") return "vercel";
        return null;
      },
    });
    expect(await getRequestId()).toBe("explicit");
  });

  it("genererar UUID om inga headers finns", async () => {
    headersMock.mockReturnValue({ get: () => null });
    const id = await getRequestId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("fail-open: genererar UUID om headers() throwar (utanför request)", async () => {
    headersMock.mockImplementation(() => {
      throw new Error("out of request context");
    });
    const id = await getRequestId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});
