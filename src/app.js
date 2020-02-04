const express = require("express");
const app = express();

app.use(express.json());

const pokemonsRouter = require("./routes/pokemons.route.js");
app.use("/pokemons", pokemonsRouter);

app.get("/", (req, res) => {
  res.json({
    "0": "GET    /",
    "1": "GET   /pokemons",
    "2": "POST    /pokemons",
    "3": "GET /pokemons/:id",
    "4": "PUT /pokemons/:id",
    "5": "DELETE /pokemons/:id",
  });
});

app.use((err, req, res, next) => {
  res.status(err.code || 500);
  if (err.code) {
    res.send({ error: err.message });
  } else {
    res.send({ error: "internal server error" });
  }
});

module.exports = app;
