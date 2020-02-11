const request = require("supertest");
const app = require("../../src/app");
const Pokemon = require("../../src/models/pokemon.model");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

const jwt = require("jsonwebtoken");
jest.mock("jsonwebtoken");

describe("pokemons", () => {
  let mongoServer;
  beforeAll(async () => {
    // SETUP OF SERVER
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
    const pokemonData = [
      {
        id: 1,
        name: "Pikachu",
        japaneseName: "ピカチュウ",
        baseHP: 35,
        category: "Mouse Pokemon",
      },
      {
        id: 2,
        name: "Squirtle",
        japaneseName: "ゼニガメ",
        baseHP: 44,
        category: "Tiny Turtle Pokemon",
      },
    ];
    await Pokemon.create(pokemonData);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await Pokemon.deleteMany();
  });

  describe("/GET pokemons", () => {
    it("GET should respond with all pokemons", async () => {
      const expectedPokemonData = [
        {
          id: 1,
          name: "Pikachu",
          japaneseName: "ピカチュウ",
          baseHP: 35,
          category: "Mouse Pokemon",
        },
        {
          id: 2,
          name: "Squirtle",
          japaneseName: "ゼニガメ",
          baseHP: 44,
          category: "Tiny Turtle Pokemon",
        },
      ];

      const { body: actualPokemons } = await request(app)
        .get("/pokemons")
        .expect(200);
      //actualPokemons.sort((a, b) => a.id > b.id);
      expect(actualPokemons).toMatchObject(expectedPokemonData);
    });

    it("POST should add a new pokemon", async () => {
      jwt.verify.mockReturnValueOnce({});

      const expectedPokemon = {
        id: 3,
        name: "New Pikachu",
        japaneseName: "new ピカチュウ",
        baseHP: 35,
        category: "Mouse Pokemon",
      };

      const { body: newPokemon } = await request(app)
        .post("/pokemons")
        .set("Cookie", "token=valid-token")
        .send(expectedPokemon)
        .expect(201);

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(newPokemon).toMatchObject(expectedPokemon);
    });
  });

  describe("/pokemon/:id", () => {
    it("GET should respond with pokemon of that id", async () => {
      const expectedPokemonData = [
        {
          id: 1,
          name: "Pikachu",
          japaneseName: "ピカチュウ",
          baseHP: 35,
          category: "Mouse Pokemon",
        },
      ];

      const { body: actualPokemon } = await request(app)
        .get(`/pokemons/${expectedPokemonData[0].id}`)
        .expect(200);
      expect(actualPokemon).toMatchObject(expectedPokemonData);
    });

    it("PUT should replace a pokemon", async () => {
      const expectedPokemon = {
        id: 2,
        name: "New Pikachu",
        japaneseName: "new ピカチュウ",
        baseHP: 35,
        category: "Mouse Pokemon",
      };

      const { body: newPokemon } = await request(app)
        .put(`/pokemons/${expectedPokemon.id}`)
        .send(expectedPokemon)
        .expect(200);

      expect(newPokemon).toMatchObject(expectedPokemon);
    });

    it("PUT should respond with error 400 when required name not given", async () => {
      const errorPokemon = {
        id: 2,
      };
      const { body } = await request(app)
        .put(`/pokemons/${errorPokemon.id}`)
        .send(errorPokemon)
        .expect(400);
      expect(body).toEqual({
        error: "Pokemon validation failed: name: Path `name` is required.",
      });
    });
  });
});
