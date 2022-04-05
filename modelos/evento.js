const mongoose = require("mongoose");

const eventoSchema = mongoose.Schema({
  nombre: String,
  //lugar = pais, estado/departamento, provincia, ciudad, direccion?
  lugar: String,
  capacidad: Number,
  estado: String,
  organizador: String,
  fechaInicio: Date,
  fechaFin:Date,
  precio: Number,
  //TODO imagenes
  imagenes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Imagen",
    },
  ],
});

module.exports = mongoose.model("Evento", eventoSchema);
