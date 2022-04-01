const mongoose = require("mongoose");

const eventoSchema = mongoose.Schema({
  nombre: String,
  lugar: String,
  capacidad: Number,
  estado: String,
  organizador: String,
  fecha: Date,
  precio: Number,
  imagenes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Imagen",
    },
  ],
});

module.exports = mongoose.model("Evento", eventoSchema);
