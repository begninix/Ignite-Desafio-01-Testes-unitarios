import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c";
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User",
      email: "test@gmail.com",
      password: "abc@123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "abc@123",
    });

    expect(response.body.user).toHaveProperty("email", "test@gmail.com");
    expect(response.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate an unexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "Fake_user",
      password: "abc@123",
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate an user with an incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User",
      email: "test@gmail.com",
      password: "abc@123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@gmail.com",
      password: "123",
    });

    expect(response.status).toBe(401);
  });
});
