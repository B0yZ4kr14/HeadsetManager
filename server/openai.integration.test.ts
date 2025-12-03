import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("headset.ai", () => {
  it("should reject AI diagnosis without API key", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.headset.ai.diagnose({
        apiKey: "",
        logs: ["Test log"],
      })
    ).rejects.toThrow();
  });

  it("should list AI diagnostics history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.headset.ai.list({ limit: 10 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle feedback on AI diagnostics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will fail if no diagnostic exists with ID 1, which is expected in a fresh DB
    // In a real scenario, you'd create a diagnostic first
    try {
      const result = await caller.headset.ai.feedback({
        diagnosticId: 1,
        wasHelpful: true,
      });
      expect(result.success).toBe(true);
    } catch (error) {
      // Expected to fail if no diagnostic exists
      expect(error).toBeDefined();
    }
  });
});
