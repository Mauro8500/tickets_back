const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");

//Modelos
const Evento = require("./modelos/evento");
const Vendedor = require("./modelos/vendedor");
const Cliente = require("./modelos/cliente");
const Compra = require("./modelos/compra");

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

//Requerimientos para creacion de PDF
const PDFDocument = require('pdfkit');

//Requerimiento para sms
const Vonage = require('@vonage/server-sdk')
const vonage = new Vonage({
  apiKey: "a78af8e2",
  apiSecret: "rc1nFsSEsCAZ9hI6"
})

//Mongo

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/tickets").then(() => {
    console.log("Database Connected");
  });
}

//CORS HEADERS MIDDLEWARE
/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});*/
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      return res.status(200).json({});
  };
  next();
});

app.listen(port, () => {
  console.log(`Tickets listening on port ${port}`);
});

//Post evento
app.post("/eventos", upload.array("images", 12), jsonParser, async (request, response) => {
    if(request.body.nombre==undefined || request.body.lugar==undefined ||
      request.body.capacidad==undefined ||
      request.body.organizador==undefined || request.body.fechaInicio==undefined ||
       request.body.fechaFin==undefined || request.body.precio==undefined ||
      request.body.nombre==""||request.body.lugar==""||
      request.body.organizador==""||
      request.body.fechaInicio==""||request.body.fechaFin==""){
      response.status(400).send("Se requieren los parametros nombre, lugar, capacidad, organizador, fechaInicio, fechaFin y precio");
    }else{
    try {
      var imagenes = [];
      if(request.files != undefined){
      for (let i = 0; i < request.files; i++) {
        imagenes.push({
          data: fs.readFileSync(path.join(__dirname + "/uploads/" + request.files[i].filename)),
          contentType: "image/png",
        });
      }
    }
      //validacion fechas
      if(request.body.fechaInicio>request.body.fechaFin){
        response.status(400).send("fechaInicio debe ser menor o igual a fechaFin");
      }else{
        let aux = new Date()
        aux.setHours(0, 0, 0, 0);
        let aux2 = new Date(request.body.fechaInicio)
        aux2.setHours(0, 0, 0, 0);
        aux2.setDate(aux2.getDate()+1)
        //llega antes if
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
                ticketsVendidos: 0,
                estado: "pendiente",
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

              if(request.body.smsActivado!=undefined){
                cliente.smsActivado=request.body.smsActivado
              }else{
                cliente.smsActivado = false
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
  var existeVendedor = false
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
  let result =  Vendedor.find().exec((err, docs) => {
        for (let i = 0, l = docs.length; i < l; i++) {
          let obj = docs[i];
            if (JSON.stringify(obj.mail) == JSON.stringify(request.body.mail) && existeVendedor==false) {
              existeVendedor=true
            }                   
        }
        if(existeVendedor==true){
          response.status(400).send("body.mail ya tiene una cuenta asociada");
        }else{
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
        
                    var result = vendedor.save();
        
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
            
        
        }
        
      }
    );
    
} catch (error) {
  response.status(500).send(error);
}




}
}
);

//Put estado de evento y/o limite de tickets
app.put("/eventos", jsonParser, async (request, response) => {
    if(request.body._id==undefined || (request.body.estado==undefined && request.body.capacidad==undefined && request.files==undefined) ||
      request.body._id==""||(request.body.estado=="")){
      response.status(400).send("Se requieren los parametros _id y estado, capacidad o imagenes");
    }else{
      var imagenes = [];
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
              if(obj.ticketsVendidos>request.body.capacidad){
                response.status(400).send("se vendieron mas tickets que los que desea configurar");
                flag=false
              }else{
                obj.capacidad = request.body.capacidad;
              }
              
            }
                }

                if(request.files!=null){
                  imagenes = obj.imagenes;
                  for (let i = 0; i < request.files; i++) {
                    imagenes.push({
                      data: fs.readFileSync(path.join(__dirname + "/uploads/" + request.files[i].filename)),
                      contentType: "image/png",
                    });
                  }
                  obj.imagenes = imagenes
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
    //eventos con cierto nombre
    try {
      let auxJson = []
      var result = await Evento.find().exec((err, docs) => {
            for (var i = 0, l = docs.length; i < l; i++) {
              var obj = docs[i];
                if (obj.nombre == request.query.nombre) {
                  auxJson.push(obj)
                }
            }
            response.send(auxJson);
          }
        );
    } catch (error) {
      response.status(500).send(error);
    }
  } else {

    if (request.query.organizador != undefined) {
      //eventos de cierto vendedor
      try {
        let auxJson = []
        var result = await Evento.find().exec((err, docs) => {
              for (var i = 0, l = docs.length; i < l; i++) {
                var obj = docs[i];
                  if (obj.organizador == request.query.organizador) {
                    auxJson.push(obj)
                  }
              }
              response.send(auxJson);
            }
          );
      } catch (error) {
        response.status(500).send(error);
      }
    } else {

      //todos los eventos
      try {
        var result = await Evento.find().exec();
        response.send(result);
      } catch (error) {
        response.status(500).send(error);
      }

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

//Put smsActivado para cliente
app.put("/clientes", jsonParser, async (request, response) => {
  if(request.body._id==undefined || request.body.smsActivado==undefined ||
    request.body._id==""){
    response.status(400).send("Se requieren los parametros _id y smsActivado");
  }else{
try {
  let flag
  await Cliente.find().exec((err, docs) => {
        for (let i = 0, l = docs.length; i < l; i++) {
          var obj = docs[i];
          var aux = JSON.stringify(obj._id);
            if (aux == JSON.stringify(request.body._id)) {
              flag = true

              if(flag == true){
                obj.smsActivado = request.body.smsActivado;
              //devuelve vacio cuando es exitoso?
              flag=false
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

//Post compras
app.post("/compras",jsonParser,async (request, response) => {
  if(request.body.idEvento==undefined || request.body.nombreEvento==undefined ||
     request.body.direccionEvento==undefined || request.body.fechaInicio==undefined ||
     request.body.fechaFin==undefined || request.body.idCliente==undefined || 
     request.body.nombre1==undefined ||request.body.apellido1==undefined||
     request.body.apellido2==undefined || request.body.nit==undefined ||
     request.body.cantidadTickets==undefined || request.body.precioUnitario==undefined ||
     request.body.correoCliente==undefined || request.body.smsActivado==undefined ||
    request.body.idEvento==""||request.body.nombreEvento==""||
    request.body.direccionEvento==""||request.body.fechaInicio==""||
    request.body.fechaFin==""||request.body.idCliente==""||
    request.body.nombre1==""||request.body.apellido1==""||
    request.body.apellido2=="" || request.body.correoCliente==""){
    response.status(400).send("Se requieren los parametros idEvento, nombreEvento, direccionEvento, fechaInicio, fechaFin, idCliente, nombre1, apellido1, apellido2, nit, cantidadTickets, precioUnitario, correoCliente y smsActivado");
  }else{
    if(request.body.cantidadTickets<=0){
      response.status(400).send("cantidadTickets debe ser positiva")
    }else{
  try {
            var compra = new Compra({
              idEvento: request.body.idEvento,
              nombreEvento: request.body.nombreEvento,
              direccionEvento: request.body.direccionEvento,
              fechaInicio: request.body.fechaInicio,
              fechaFin: request.body.fechaFin,
              idCliente: request.body.idCliente,
              nombre1: request.body.nombre1,
              apellido1: request.body.apellido1,
              apellido2: request.body.apellido2,
              nit: request.body.nit,
              cantidadTickets: request.body.cantidadTickets,
              precioUnitario: request.body.precioUnitario,
              estado: "completada"
            });
            
            //TODO stripe, numeroFactura y numeroSFV
            compra.numeroFactura = 13
            compra.numeroSFV = 14

            compra.fechaEmision = new Date()
            compra.total = compra.cantidadTickets * compra.precioUnitario

            if(request.body.nombre2!=undefined && request.body.nombre2!=""){
              compra.nombre2 = request.body.nombre2
            }else{
              compra.nombre2 = ""
            }

            var result = await compra.save();

            //Comentado para no quedar sin credito
            /*if(request.body.smsActivado == true){
              //mandar sms
              const from = "Tickets"
              const to = "591"+request.body.telefono
              to = "59173747260"
              const text = 'Su compra ha sido registrada exitosamente'

              vonage.message.sendSms(from, to, text, (err, responseData) => {
                if (err) {
                    console.log(err);
                } else {
                    if(responseData.messages[0]['status'] === "0") {
                        console.log("Message sent successfully.");
                    } else {
                        console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                    }
                }
            })
            }*/

                        //crear pdf de factura
                        let pdf = new PDFDocument;
                        pdf.fontSize(15).text(' Número de factura: '+compra.numeroFactura+
                        '\n Número SFV: '+compra.numeroSFV+'\n Actividad económica: Venta de tickets \n Título: Factura \n NIT: '+
                        compra.nit+'\n Fecha de emisión: '+formatearFecha(compra.fechaEmision)+'\n Código del evento: '+compra.idEvento+'\n Nombre del evento: '+compra.nombreEvento+
                        '\n Fecha de inicio: '+formatearFecha(compra.fechaInicio)+'       Fecha de conclusión: '+formatearFecha(compra.fechaFin)+
                        '\n Nombre: '+capitalizarPrimeraLetra(compra.apellido1)+" "+capitalizarPrimeraLetra(compra.apellido2)
                        +" "+capitalizarPrimeraLetra(compra.nombre1)+" "+capitalizarPrimeraLetra(compra.nombre2)+'\n Cantidad de tickets: '+
                        compra.cantidadTickets+'\n Precio unitario: '+compra.precioUnitario+'           Costo total: '+compra.total
                        , 100, 100);

            // Adding an image in the pdf.
            /*pdf.image('download3.jpg', {
              fit: [300, 300],
              align: 'center',
              valign: 'center'
            });*/
            
            //pdf.addPage().fontSize(15).text('Generating PDF with the help of pdfkit', 100, 100);
              
            // Apply some transforms and render an SVG path with the 
            // 'even-odd' fill rule
            /*pdf.scale(0.6).translate(470, -380)
            .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
            .fill('red', 'even-odd')
            .restore();*/
             
            // Add some text with annotations
            /*pdf.addPage().fillColor('blue').text('The link for GeeksforGeeks website', 100, 100)
              .link(100, 100, 160, 27, 'https://www.geeksforgeeks.org/');*/
            pdf.end();

            //agregar factura al mail
            var attachments = []
            attachments.push({filename: 'factura.pdf',
            content: pdf,
            contentType: 'application/pdf'
          })

          //crear tickets y agregarlos al mail
            for(let i = 0; i<compra.cantidadTickets; i++){
              let pdfaux =new PDFDocument
              pdfaux.fontSize(15).text(' Número de factura: '+compra.numeroFactura+
                        '\n Número SFV: '+compra.numeroSFV+'\n NIT: '+
                        compra.nit+'\n Fecha de emisión: '+formatearFecha(compra.fechaEmision)+'\n Código del evento: '+compra.idEvento+'\n Nombre del evento: '+compra.nombreEvento+
                        '\n Fecha de inicio: '+formatearFecha(compra.fechaInicio)+'       Fecha de conclusión: '+formatearFecha(compra.fechaFin)+
                        '\n Nombre: '+capitalizarPrimeraLetra(compra.apellido1)+" "+capitalizarPrimeraLetra(compra.apellido2)
                        +" "+capitalizarPrimeraLetra(compra.nombre1)+" "+capitalizarPrimeraLetra(compra.nombre2)+'\n Ticket '+(i+1)+"/"+compra.cantidadTickets
                        , 100, 100);
              pdfaux.end();
              attachments.push(
                {
                  filename: 'ticket'+(i+1)+'.pdf',
                  content: pdfaux,
                  contentType: 'application/pdf'
              })
            }

            let mailOptions = {
              from: "carlosmendizabaltickets@gmail.com",
              to: request.body.correoCliente,
              subject: "Recibo de compra y tickets",
              attachments: attachments
            };

            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });

            response.send(result);
        
    
  } catch (error) {
    response.status(500).send(error);
  }
}
}
}
);

//Get compras
app.get("/compras", jsonParser, async (request, response) => {
  if (request.query._id ==undefined || request.query._id == "") {
    response.status(400).send("Se requiere el parametro _id")
  } else {
    try {


      let vectorCompras = []
      let result = await Compra.find().exec((err, docs) => {
        for (let i = 0, l = docs.length; i < l; i++) {
          var obj = docs[i];
            if (obj.idCliente == request.query._id) {
              vectorCompras.push(obj)
            }
        }
        response.send(vectorCompras);
      })



    } catch (error) {
      response.status(500).send(error);
    }
  }
});

//auth de clientes
app.get("/authclientes", jsonParser, async (request, response) => {
  if(request.query.mail == undefined || request.query.password == undefined ||
    request.query.mail == "" || request.query.password == ""){
    response.status(400).send("Se requieren los parametros mail y password");
  }else{
try {
  let result = []
  await Cliente.find().exec((err, docs) => {
        for (let i = 0, l = docs.length; i < l; i++) {
          var obj = docs[i];
          var mail = JSON.stringify(obj.mail);
          var password = JSON.stringify(obj.password);
            if (mail == JSON.stringify(request.query.mail) && password == JSON.stringify(request.query.password)) {
                result = obj;
            }
        }
        response.send(result);
      }
    );
} catch (error) {
  response.status(500).send(error);
}
}

});

//auth de vendedores
app.get("/authvendedores", jsonParser, async (request, response) => {
  if(request.query.mail == undefined || request.query.password == undefined ||
    request.query.mail == "" || request.query.password == ""){
    response.status(400).send("Se requieren los parametros mail y password");
  }else{
try {
  let result = []
  await Vendedor.find().exec((err, docs) => {
        for (let i = 0, l = docs.length; i < l; i++) {
          var obj = docs[i];
          var mail = JSON.stringify(obj.mail);
          var password = JSON.stringify(obj.password);
            if (mail == JSON.stringify(request.query.mail) && password == JSON.stringify(request.query.password)) {
                result = obj;
            }
        }
        response.send(result);
      }
    );
} catch (error) {
  response.status(500).send(error);
}
}

});

//Put aumentar tickets vendidos
app.put("/tickets", jsonParser, async (request, response) => {
  if(request.body._id==undefined || request.body.tickets==undefined
  || request.body._id==""){
    response.status(400).send("Se requieren los parametros _id y tickets");
  }else{
    if(request.body.tickets<1){
      response.status(400).send("el parametro tickets debe ser mayor a 0");
    }else{
      try {
        await Evento.find().exec((err, docs) => {
              for (let i = 0, l = docs.length; i < l; i++) {
                let flag = false
                var obj = docs[i];
                var aux = JSON.stringify(obj._id);
                  if (aux == JSON.stringify(request.body._id)) {
                    if(request.body.tickets+obj.ticketsVendidos<=obj.capacidad){
                      obj.ticketsVendidos+=request.body.tickets
                      flag=true
                    }else{
                      response.status(400).send("No alcanzan los tickets");
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

}

});

function capitalizarPrimeraLetra(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatearFecha(dateObj){
  return dateObj.getUTCDate()+ "/" + (dateObj.getUTCMonth() + 1) + "/"+dateObj.getUTCFullYear() ;
}

//plantillas rest
app.delete("/user", (req, res) => {
  res.send("Got a DELETE request at /user");
});