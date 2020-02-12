const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const corsOptions = {
  credentials: true,
  allowedHeaders: "content-type",
  origin: "http://localhost:3001", // for the frontend server
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());

const pokemonsRouter = require("./routes/pokemons.route");
const trainersRouter = require("./routes/trainers.route");
app.use("/pokemons", pokemonsRouter);
app.use("/trainers", trainersRouter);

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
  res.status(err.statusCode || 500);
  console.error(err);
  if (err.statusCode) {
    res.send({ error: err.message });
  } else {
    res.send({ error: "internal server error" });
  }
});

module.exports = app;
