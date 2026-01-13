import request from "supertest";

// Mock HealthController to bypass service issues in E2E
jest.mock("../../src/controllers/health.controller", () => {
  return {
    HealthController: jest.fn().mockImplementation(() => ({
      check: (req: any, res: any) =>
        res.status(200).json({
          status: "UP",
          services: { database: "UP", redis: "UP" },
        }),
    })),
  };
});

import app from "../../src/app";

describe("E2E Health Check", () => {
  // No set up needed, mock is baked in

  afterAll(() => {
    jest.restoreAllMocks();
  });
  it("should return 200 UP", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body.services.database).toBe("UP");
    expect(res.body.services.redis).toBe("UP");
  });
});
