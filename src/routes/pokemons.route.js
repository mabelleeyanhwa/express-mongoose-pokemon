const express = require("express");
const router = express.Router();

const Pokemon = require("./models/pokemon.model");

router.get("/", (req, res) => {
  try {
    const pokemons = await Pokemon.find(req.query);
    res.send(pokemons);
  } catch (err) {
    next(err);
  }
});

router.get("/:name", async (req, res, next) => {
  try {
    const name = req.params.name;
    const regex = new RegExp(name, "gi");
    const pokemons = await Pokemon.find({name: regex});
    res.send(pokemons);
  } catch (err) {
    next(err);
  }
});

module.exports = router;