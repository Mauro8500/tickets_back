const mongoose = require("mongoose");

const vendedorSchema = mongoose.Schema({
  nombre: String,
  fechaDeNacimiento: Date,
  ci: String,
  pais: String,
  email: String,
  contrasena: String,
  ubicacion: String,
  telefono: Number,
  tipoDeEmpresa: String,
  tarjetaDeCredito: String,
});

module.exports = mongoose.model("Vendedor", vendedorSchema);
