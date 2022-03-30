const mongoose = require('mongoose')

const eventoSchema = mongoose.Schema({
    
    nombre:String,
    lugar:String,
    capacidad: Number,
    fecha:Date,
    precio: Number,
})

module.exports = mongoose.model('Evento', eventoSchema)