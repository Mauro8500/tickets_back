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
  pais: String,
  ciudad: String,
  telefono: Number,
  cuenta: String,
    //tipoDeEmpresa: String,
});

module.exports = mongoose.model("Vendedor", vendedorSchema);

//vendedor de tickets
