const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../src/app");

const { MongoMemoryServer } = require("mongodb-memory-server");
const Trainer = require("../../src/models/trainer.model");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

const jwt = require("jsonwebtoken");
jest.mock("jsonwebtoken");

describe("trainers", () => {
  let mongoServer;
  beforeAll(async () => {
    try {
      mongoServer = new MongoMemoryServer();
      const mongoUri = await mongoServer.getConnectionString();
      await mongoose.connect(mongoUri);
    } catch (err) {
      console.error(err);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const TrainerData = [
      {
        username: "ash1",
        password: "iWannaB3DVeryBest",
      },
      {
        username: "ash2",
        password: "simplepassword",
      },
    ];
    await Trainer.create(TrainerData);
    //jest.spyOn(console, "error");
    //console.error.mockReturnValue({});
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await Trainer.deleteMany();
  });

  describe("/trainers/register", () => {
    it("POST should add a new trainer", async () => {
      const expectedTrainer = {
        username: "ash3",
        password: "123456789",
      };
      const { body: trainer } = await request(app)
        .post("/trainers/register")
        .send(expectedTrainer)
        .expect(201);

      expect(trainer.username).toBe(expectedTrainer.username);
      expect(trainer.password).not.toBe(expectedTrainer.password);
    });

    it("POST should not add a new trainer when password less than 8 ", async () => {
      const wrongTrainer = {
        username: "ash3",
        password: "1234567",
      };
      const { body: error } = await request(app)
        .post("/trainers/register")
        .send(wrongTrainer)
        .expect(400);
      expect(error.error).toContain("validation failed");
    });
  });

  describe("/trainers/:username", () => {
    it("GET should respond with trainer details when login as correct trainer", async () => {
      const expectedTrainer = {
        username: "ash1",
      };
      jwt.verify.mockReturnValueOnce({ name: expectedTrainer.username });
      const { body: trainers } = await request(app)
        .get(`/trainers/${expectedTrainer.username}`)
        .set("Cookie", "token=valid-token")
        .expect(200);

      expect(jwt.verify).toHaveBeenCalledTimes(1);

      expect(trainers[0]).toMatchObject(expectedTrainer);
    });

    it("GET should respond with incorrect trainer message when login as incorrect trainer", async () => {
      const wrongTrainer = {
        username: "ash1",
      };
      jwt.verify.mockReturnValueOnce({ name: wrongTrainer.username });
      const { body: error } = await request(app)
        .get(`/trainers/ash2`)
        .set("Cookie", "token=valid-token")
        .expect(403);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(error).toEqual({ error: "Incorrect trainer!" });
    });

    it("GET should deny access when no token is provided", async () => {
      const { body: error } = await request(app)
        .get(`/trainers/ash2`)
        .expect(401);
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(error).toEqual({ error: "You are not authorized" });
    });
    it("GET should deny access when token is invalid", async () => {
      const errorMessage = "your token is invalid";
      jwt.verify.mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      const { body: error } = await request(app)
        .get(`/trainers/ash2`)
        .set("Cookie", "token=invalid-token")
        .expect(401);

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(error.error).toEqual(errorMessage);
    });
  });

  describe("/trainers/login", () => {
    it("should log trainer in when password is correct", async () => {
      const correctTrainer = {
        username: "ash2",
        password: "simplepassword",
      };
      const { text: message } = await request(app)
        .post("/trainers/login")
        .send(correctTrainer)
        .expect(200);
      expect(message).toEqual("You are now logged in!");
    });

    it("should not log trainer in when password is incorrect", async () => {
      const wrongTrainer = {
        username: "ash2",
        password: "wrongpassword",
      };
      const { body: message } = await request(app)
        .post("/trainers/login")
        .send(wrongTrainer)
        .expect(400);
      expect(message).toEqual({ error: "Login failed" });
    });
  });
});

// test trainer
// test login logout
