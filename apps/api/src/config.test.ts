import { describe, expect, it } from "vitest";
import { readConfig } from "./config.js";

describe("API configuration", () => {
  it("uses safe local defaults and rejects invalid ports", () => {
    expect(readConfig({})).toEqual({ host: "127.0.0.1", port: 3001 });
    expect(() => readConfig({ API_PORT: "not-a-port" })).toThrow(/API_PORT/);
    expect(() => readConfig({ API_PORT: "70000" })).toThrow(/API_PORT/);
  });
});
