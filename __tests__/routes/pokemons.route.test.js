const request = require("supertest");
const app = require("../../src/app");

beforeEach(async () => {
  //// as if we dropping database
  //const agent = request(app);
  //await agent.delete("/jumplings");
});

describe("/pokemons", () => {
  it("GET should respond with all pokemons", async () => {
    const expectedPokemons = [
      {
        name: "Pikachu",
        japaneseName: "ピカチュウ",
        baseHP: 35,
        category: "Mouse Pokemon",
      },
    ];
    const { body: actualPokemons } = await request(app)
      .get("/pokemons")
      .expect(200);
    expect();
  });
});
