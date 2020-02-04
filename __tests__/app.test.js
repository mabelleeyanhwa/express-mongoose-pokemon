const request = require("supertest");
const app = require("../src/app");

describe("/", () => {
  it("GET should respond with correct api message", async () => {
    const { body: apiMessage } = await request(app)
      .get("/")
      .expect(200);
    expect(apiMessage).toEqual({
      "0": "GET    /",
      "1": "GET   /pokemons",
      "2": "POST    /pokemons",
      "3": "GET /pokemons/:id",
      "4": "PUT /pokemons/:id",
      "5": "DELETE /pokemons/:id",
    });
  });
});
