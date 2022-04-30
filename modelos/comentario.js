const mongoose = require("mongoose");

const comentarioSchema = mongoose.Schema({
  idEvento: String,
  idCliente: String,
  comentario: String,
  fecha: Date,
});

module.exports = mongoose.model("Comentario", comentarioSchema);