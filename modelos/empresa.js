const mongoose = require('mongoose')

const empSchema = mongoose.Schema({
    
    nombre:String,
    descripcion:String,
    encargado: String,
 
})

module.exports = mongoose.model('Empresa', empSchema)