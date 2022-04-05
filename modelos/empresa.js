//TODO
const mongoose = require('mongoose')

const empresaSchema = mongoose.Schema({
    
    nombre:String,
    descripcion:String,
    encargado: String,
 
})

module.exports = mongoose.model('Empresa', empresaSchema)