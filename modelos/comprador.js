const mongoose = require("mongoose");

const compradorSchema = mongoose.Schema({
  nombre: String,
  fechaDeNacimiento: Date,
  ci: String,
  email: String,
  contrasena: String,
  ciudad: String,
});

module.exports = mongoose.model("Comprador", compradorSchema);

//estructura principal de comprador
