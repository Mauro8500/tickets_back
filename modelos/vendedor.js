const mongoose = require("mongoose");

const vendedorSchema = mongoose.Schema({
  nombre1: String,
  nombre2: String,
  apellido1: String,
  apellido2: String,
  fechaNacimiento: Date,
  password: String,
  ci: String,
  mail: String,
  telefono: Number,
  //pais: String,
  departamento: String,
  ciudad: String,
  estado: Boolean,
  banco: String,
  cuenta: String
});

module.exports = mongoose.model("Vendedor", vendedorSchema);
