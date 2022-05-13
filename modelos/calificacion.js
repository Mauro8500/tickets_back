const mongoose = require("mongoose");

const calificacionSchema = mongoose.Schema({
    idEvento: String,
    idCliente: String,
    calificacion: Number,
    fecha: Date,
});

module.exports = mongoose.model("Calificacion", calificacionSchema);

//dta