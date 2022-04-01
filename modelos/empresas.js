const mongoose = require('mongoose')

const empSchema = mongoose.Schema({
    
    nombre:String,
    descripcion:String,
    encargado: String,
 
})

module.exports = mongoose.model('Empresas', empSchema)


//estructura de empresa o encargado de las ventas de tickets