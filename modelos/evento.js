const mongoose = require("mongoose");

const eventoSchema = mongoose.Schema({
  nombre: String,
  //lugar = pais, estado/departamento, provincia, ciudad, direccion? evc
  lugar: String,
  capacidad: Number,
  ticketsVendidos: Number,
  estado: String,
  organizador: String,
  fechaInicio: Date,
  fechaFin:Date,
  precio: Number,
  imagenes: [
    {data: Buffer, contentType: String},
  ],
  //codigo antiguo
 /*imagenes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Imagen",
    },
  ],*/
});

module.exports = mongoose.model("Evento", eventoSchema);
