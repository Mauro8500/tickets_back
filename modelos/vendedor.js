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
//asd
  departamento: String,
  ciudad: String,
  estado: Boolean,
  banco: String,
  cuenta: String,
  esEmpresa: Boolean,
  nombreEmpresa: String,
  telefonoEmpresa: Number,
  direccionEmpresa: String,
  sitioWebEmpresa: String
});

module.exports = mongoose.model("Vendedor", vendedorSchema);
