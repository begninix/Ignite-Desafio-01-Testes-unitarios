import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User",
      email: "test@gmail.com",
      password: "abc@123",
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create an user with an email already in use", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User",
      email: "test@gmail.com",
      password: "abc@123",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "User2",
      email: "test@gmail.com",
      password: "4321",
    });

    expect(response.status).toBe(400);
  });
});
