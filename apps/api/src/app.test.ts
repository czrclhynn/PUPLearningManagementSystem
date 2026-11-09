import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const apps: ReturnType<typeof createApp>[] = [];
afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("API health", () => {
  it("reports readiness without a network listener", async () => {
    const app = createApp();
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("hides internal failures from clients", async () => {
    const app = createApp();
    apps.push(app);
    app.get("/failure-example", async () => {
      throw new Error("Private failure details");
    });

    const response = await app.inject({ method: "GET", url: "/failure-example" });
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: "Internal Server Error" });
  });
});
