const pokemonSchema = Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
  },
  japaneseName: String,
  baseHP: Number,
  category: String,
});

const Pokemon = mongoose.model("Pokemon", pokemonSchema);
module.exports = Pokemon;
