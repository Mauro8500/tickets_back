const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");

//Modelos
const Evento = require("./modelos/evento");
const Vendedor = require("./modelos/vendedor");
const Cliente = require("./modelos/cliente");

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
var fs = require("fs");
var path = require("path");

//crypto
//const cryptoRandomString = require('crypto-random-string');
//var randomstring = require("randomstring");
//const crypto = require('crypto');

//Storage de imagenes
var multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

//configuracion mail
const nodemailer = require("nodemailer");
const req = require("express/lib/request");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, //use SSL
  auth: {
    user: "carlosmendizabaltickets@gmail.com",
    pass: "tallersistemastickets",
  },
});

//Mongo

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/tickets").then(() => {
    console.log("Database Connected");
  });
}

app.listen(port, () => {
  console.log(`Tickets listening on port ${port}`);
});

//Post evento
app.post("/eventos", upload.array("images", 12), jsonParser, async (request, response) => {
    if(request.body.nombre==undefined || request.body.lugar==undefined ||
      request.body.capacidad==undefined || request.body.estado==undefined ||
      request.body.organizador==undefined || request.body.fechaInicio==undefined ||
       request.body.fechaFin==undefined || request.body.precio==undefined ||
      request.body.nombre==""||request.body.lugar==""||
      request.body.estado==""||request.body.organizador==""||
      request.body.fechaInicio==""||request.body.fechaFin==""){
      response.status(400).send("Se requieren los parametros nombre, lugar, capacidad, estado, organizador, fechaInicio, fechaFin y precio");
    }else{
    try {
      var imagenes = [];
      //if(request.files != undefined){
      for (let i = 0; i < request.files; i++) {
        imagenes.push({
          data: fs.readFileSync(path.join(__dirname + "/uploads/" + request.files[i].filename)),
          contentType: "image/png",
        });
      }
    //}

      //validacion fechas
      if(request.body.fechaInicio>request.body.fechaFin){
        response.status(400).send("fechaInicio debe ser menor o igual a fechaFin");
      }else{
        let aux = new Date()
        aux.setHours(0, 0, 0, 0);
        let aux2 = new Date(request.body.fechaInicio)
        aux2.setHours(0, 0, 0, 0);
        aux2.setDate(aux2.getDate()+1)
        if(aux2<aux){
          response.status(400).send("fechaInicio no puede ser menor a actual");
        }else{
        //validacion precio
          if(request.body.precio<0){
            response.status(400).send("precio no puede ser negativo");
          }else{
            //validacion capacidad
            if(request.body.capacidad<=0){
              response.status(400).send("capacidad debe ser positiva");
            }else{
              var evento = new Evento({
                nombre: request.body.nombre,
                lugar: request.body.lugar,
                capacidad: request.body.capacidad,
                estado: request.body.estado,
                organizador: request.body.organizador,
                fechaInicio: request.body.fechaInicio,
                fechaFin: request.body.fechaFin,
                precio: request.body.precio,
                imagenes: imagenes,
              });
              var result = await evento.save();
              response.send(result);
            }
          }
        }
      }
      
    } catch (error) {
      response.status(500).send(error);
    }
  }
  }
);


//Post cliente
app.post("/clientes",jsonParser,async (request, response) => {
    if(request.body.nombre1==undefined || request.body.apellido1==undefined ||
       request.body.apellido2==undefined || request.body.fechaNacimiento==undefined ||
       request.body.ci==undefined || request.body.mail==undefined || 
       request.body.password==undefined ||request.body.repassword==undefined||
       request.body.departamento==undefined || request.body.ciudad==undefined ||
      request.body.nombre1==""||request.body.apellido1==""||
      request.body.apellido2==""||request.body.fechaNacimiento==""||
      request.body.ci==""||request.body.mail==""||
      request.body.password==""||request.body.repassword==""||
      request.body.departamento==""||request.body.ciudad==""){
      response.status(400).send("Se requieren los parametros nombre1, apellido1, apellido2, fechaNacimiento, ci, mail, password, repassword, departamento y ciudad");
    }else{
    try {
      //validacion fecha de nacimiento
      let aux = new Date()
      aux.setHours(0, 0, 0, 0);
      let aux2 = new Date(request.body.fechaNacimiento)
      aux2.setHours(0, 0, 0, 0);
      aux2.setDate(aux2.getDate()+1)
      if(aux2>=aux){
        response.status(400).send("fechaNacimiento debe ser menor a actual");
      }else{
        //validacion password y su repeticion
          if(request.body.password != request.body.repassword){
            response.status(400).send("Los parametros password y repassword deben ser iguales");
          }else{
              var cliente = new Cliente({
                nombre1: request.body.nombre1,
                apellido1: request.body.apellido1,
                apellido2: request.body.apellido2,
                fechaNacimiento: request.body.fechaNacimiento,
                password: request.body.password,
                ci: request.body.ci,
                mail: request.body.mail,
                departamento: request.body.departamento,
                ciudad: request.body.ciudad,
                estado: false
              });
              //adicion de apellido si existe
              if(request.body.nombre2!=undefined && request.body.nombre2!=""){
                cliente.nombre2 = request.body.nombre2
              }else{
                cliente.nombre2 = ""
              }
              //adicion de telefono si existe
              if(request.body.telefono!=undefined){
                cliente.telefono=request.body.telefono
              }else{
                cliente.telefono = -1
              }

              var result = await cliente.save();

              //codigo confirmador no implementado
              /*let randomString = randomstring.generate(128);
              let hash = crypto.createHash('sha256').update(randomString).digest('hex');
              var confirmador = new Confirmador({
                hash: hash,
                mail: request.body.mail
              });
              result = await confirmador.save();
              */

              let mailOptions = {
                from: "carlosmendizabaltickets@gmail.com",
                to: request.body.mail,
                subject: "Confirmación de correo electrónico",
                text: "Para activar tu cuenta ingresa a este link:",
                html: '<p>Ingresa a <a href="http://localhost:3000/confirmacionclientes?c=' + result._id + '">este link</a> para confirmar tu dirección de correo electrónico</p>'
              };

              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });

              response.send(result);
          }
          
      }
      
    } catch (error) {
      response.status(500).send(error);
    }
  }
  }
);

//Post vendedor
app.post("/vendedores",jsonParser,async (request, response) => {
  if(request.body.nombre1==undefined || request.body.apellido1==undefined ||
     request.body.apellido2==undefined || request.body.fechaNacimiento==undefined ||
     request.body.ci==undefined || request.body.mail==undefined || 
     request.body.password==undefined ||request.body.repassword==undefined||
     request.body.departamento==undefined || request.body.ciudad==undefined ||
     request.body.banco==undefined || request.body.cuenta==undefined ||
    request.body.nombre1==""||request.body.apellido1==""||
    request.body.apellido2==""||request.body.fechaNacimiento==""||
    request.body.ci==""||request.body.mail==""||
    request.body.password==""||request.body.repassword==""||
    request.body.departamento==""||request.body.ciudad==""||
    request.body.banco==""||request.body.cuenta==""||
    request.body.esEmpresa==undefined){
    response.status(400).send("Se requieren los parametros nombre1, apellido1, apellido2, fechaNacimiento, ci, mail, password, repassword, departamento, ciudad, banco, cuenta y esEmpresa");
  }else{
  try {
    //validacion fecha de nacimiento
    let aux = new Date()
    aux.setHours(0, 0, 0, 0);
    let aux2 = new Date(request.body.fechaNacimiento)
    aux2.setHours(0, 0, 0, 0);
    aux2.setDate(aux2.getDate()+1)
    if(aux2>=aux){
      response.status(400).send("fechaNacimiento debe ser menor a actual");
    }else{
      //validacion password y su repeticion
        if(request.body.password != request.body.repassword){
          response.status(400).send("Los parametros password y repassword deben ser iguales");
        }else{
            var vendedor = new Vendedor({
              nombre1: request.body.nombre1,
              apellido1: request.body.apellido1,
              apellido2: request.body.apellido2,
              fechaNacimiento: request.body.fechaNacimiento,
              password: request.body.password,
              ci: request.body.ci,
              mail: request.body.mail,
              departamento: request.body.departamento,
              ciudad: request.body.ciudad,
              estado: false,
              banco: request.body.banco,
              cuenta: request.body.cuenta,
              esEmpresa: request.body.esEmpresa
            });
            //adicion de apellido si existe
            if(request.body.nombre2!=undefined && request.body.nombre2!=""){
              vendedor.nombre2 = request.body.nombre2
            }else{
              vendedor.nombre2 = ""
            }
            //adicion de telefono si existe
            if(request.body.telefono!=undefined){
              vendedor.telefono=request.body.telefono
            }else{
              vendedor.telefono = -1
            }

            if(request.body.nombreEmpresa!=undefined){
              vendedor.nombreEmpresa=request.body.nombreEmpresa
            }else{
              vendedor.nombreEmpresa=""
            }
            if(request.body.telefonoEmpresa!=undefined){
              vendedor.telefonoEmpresa=request.body.telefonoEmpresa
            }else{
              vendedor.telefonoEmpresa=0
            }
            if(request.body.direccionEmpresa!=undefined){
              vendedor.direccionEmpresa=request.body.direccionEmpresa
            }else{
              vendedor.direccionEmpresa=""
            }
            if(request.body.sitioWebEmpresa!=undefined){
              vendedor.sitioWebEmpresa=request.body.sitioWebEmpresa
            }else{
              vendedor.sitioWebEmpresa=""
            }

            var result = await vendedor.save();

            let mailOptions = {
              from: "carlosmendizabaltickets@gmail.com",
              to: request.body.mail,
              subject: "Confirmación de correo electrónico",
              text: "Para activar tu cuenta ingresa a este link:",
              html: '<p>Ingresa a <a href="http://localhost:3000/confirmacionvendedores?v=' + result._id + '">este link</a> para confirmar tu dirección de correo electrónico</p>'
            };

            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });

            response.send(result);
        }
        
    }
    
  } catch (error) {
    response.status(500).send(error);
  }
}
}
);



//Put estado de evento y/o limite de tickets
app.put("/eventos", jsonParser, async (request, response) => {
    if(request.body._id==undefined || (request.body.estado==undefined && request.body.capacidad==undefined) ||
      request.body._id==""||(request.body.estado=="")){
      response.status(400).send("Se requieren los parametros _id y estado o capacidad");
    }else{
  try {
    await Evento.find().exec((err, docs) => {
          for (let i = 0, l = docs.length; i < l; i++) {
            var obj = docs[i];
            var aux = JSON.stringify(obj._id);
              if (aux == JSON.stringify(request.body._id)) {
                let flag = true
                if(request.body.estado!=undefined && request.body.estado!=""){
                  obj.estado = request.body.estado;
                }
                if(request.body.capacidad!=undefined){

            //validacion capacidad
            if(request.body.capacidad<=0){
              response.status(400).send("capacidad debe ser positiva");
              flag = false
            }else{
              obj.capacidad = request.body.capacidad;
            }

                }

                if(flag == true){
                //devuelve vacio cuando es exitoso?
                let result = obj.save();
                response.send(result);
                }else{
                  //NO HACE NADA
                }

              }
          }
        }
      );
  } catch (error) {
    response.status(500).send(error);
  }
}

});

//Get eventos
app.get("/eventos", jsonParser, async (request, response) => {
  if (request.query.nombre != undefined) {
    //crash si hay mas de un evento con el nombre solicitado
    try {
      var result = await Evento.find().exec((err, docs) => {
            for (var i = 0, l = docs.length; i < l; i++) {
              var obj = docs[i];
                if (obj.nombre == request.query.nombre) {
                  response.send(obj);
                }
            }
          }
        );
    } catch (error) {
      response.status(500).send(error);
    }
  } else {
    try {
      var result = await Evento.find().exec();
      response.send(result);
    } catch (error) {
      response.status(500).send(error);
    }
  }
});

//Get confirmacion clientes
app.get("/confirmacionclientes", jsonParser, async (request, response) => {
  if (request.query.c != undefined || request.query.c != "") {
    let idConfirmacion = ""
    try {
      var result = await Cliente.find().exec((err, docs) => {
            for (let i = 0, l = docs.length; i < l; i++) {
              let obj = docs[i];
                if (obj._id == request.query.c) {
                  obj.estado = true
                  obj.save()
                  response.send("Su correo ha sido confirmado. Ahora puede realizar transacciones");
                }                   
            }
          }
        );
        
    } catch (error) {
      response.status(500).send(error);
    }

  } else {
    response.status(400).send("solicitud invalida");
  }
});

//Get confirmacion vendedores
app.get("/confirmacionvendedores", jsonParser, async (request, response) => {
  if (request.query.v != undefined || request.query.v != "") {
    let idConfirmacion = ""
    try {
      var result = await Vendedor.find().exec((err, docs) => {
            for (let i = 0, l = docs.length; i < l; i++) {
              let obj = docs[i];
                if (obj._id == request.query.v) {
                  obj.estado = true
                  obj.save()
                  response.send("Su correo ha sido confirmado. Ahora puede realizar transacciones");
                }                   
            }
          }
        );
        
    } catch (error) {
      response.status(500).send(error);
    }

  } else {
    response.status(400).send("solicitud invalida");
  }
});

//Get vendedores
app.get("/vendedores", jsonParser, async (request, response) => {
  if (request.query._id != undefined) {
    try {
      let result = await Vendedor.findById(request.query._id).exec();
      response.send(result);
    } catch (error) {
      response.status(500).send(error);
    }
  } else {
    try {
      let result = await Vendedor.find().exec();
      response.send(result);
    } catch (error) {
      response.status(500).send(error);
    }
  }
});

//Get clientes
app.get("/clientes", jsonParser, async (request, response) => {
  if (request.query._id !=undefined) {
    try {
      let result = await Cliente.findById(request.query._id).exec();
      response.send(result);
    } catch (error) {
      response.status(500).send(error);
    }
  } else {
    try {
      let result = await Cliente.find().exec();
      response.send(result);
    } catch (error) {
      response.status(500).send(error);
    }
  }
});

//plantillas rest

app.delete("/user", (req, res) => {
  res.send("Got a DELETE request at /user");
});

//Ok hasta aqui

//Put imagenes
//Agregar imagenes a response de get eventos?