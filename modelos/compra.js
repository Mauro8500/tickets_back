const mongoose = require("mongoose");

const compraSchema = mongoose.Schema({
  idEvento: String,
  nombreEvento: String,
  direccionEvento: String,
  fechaInicio: Date,
  fechaFin:Date,

  idCliente: String,
  nombre1: String,
  nombre2: String,
  apellido1: String,
  apellido2: String,

  numeroFactura: Number,
  numeroSFV: Number,
  //actividadEconomica = ventade tickets
  //titulo = factura
  nit: Number,
  fechaEmision: Date, //orden dia mes anno,
  cantidadTickets: Number,
  precioUnitario: Number,
  total: Number,
  
  estado: String,

  correoCliente: String,
  numTelefono: Number,
  smsActivado: Boolean
});

module.exports = mongoose.model("Compra", compraSchema);