const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const Pokemon = require("../models/pokemon.model");
const wrapAsync = require("../utils/wrapAsync");

const findByName = async name => {
  const regex = new RegExp(name, "gi");
  const filteredPokemons = await Pokemon.find({ name: regex });
  return filteredPokemons;
};

const { protectRoute } = require("../middlewares/auth");

router.get("/", async (req, res) => {
  try {
    const name = req.query.name;
    if (name) {
      const pokemons = await findByName(name);
      res.send(pokemons);
    }
    const pokemons = await Pokemon.find();
    res.send(pokemons);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const pokemons = await Pokemon.find({ id });
    res.send(pokemons);
  } catch (err) {
    next(err);
  }
});

router.post("/", protectRoute, async (req, res, next) => {
  try {
    const pokemon = new Pokemon(req.body);
    await Pokemon.init(); // make sure indexes are done building
    const newPokemon = await pokemon.save();
    res.status(201).send(newPokemon);
  } catch (err) {
    // ValidationError is from await pokemon.save() by Mongoose
    if (err.name === "ValidationError") {
      err.status = 400;
    }
    next(err);
  }
});

const findOneAndReplace = async (req, res, next) => {
  const id = req.params.id;
  const newPokemon = req.body;
  const pokemon = await Pokemon.findOneAndReplace({ id }, newPokemon, {
    new: true,
  });
  res.send(pokemon);
};

router.put("/:id", wrapAsync(findOneAndReplace));

router.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    err.statusCode = 400;
  } else if (err.name === "MongoError" && err.code === 11000) {
    err.statusCode = 422;
  }
  next(err);
});

module.exports = router;
