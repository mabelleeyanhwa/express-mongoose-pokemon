const express = require("express");
const router = express.Router();

const pokemons = [];
router.get("/", (req, res) => {
  res.send(pokemons);
});
module.exports = router;
