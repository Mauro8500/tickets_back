const mongoose = require("mongoose");

const clienteSchema = mongoose.Schema({
  nombre1: String,
  nombre2: String,
  apellido1: String,
  apellido2: String,
  fechaNacimiento: Date,
  password: String,
  ci: String,
  mail: String,
});

module.exports = mongoose.model("Cliente", clienteSchema);

//evento y sus datos
