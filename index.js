//Express config (localhost:3000)
const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");
const Evento = require("./modelos/evento");
const Empresas = require("./modelos/empresas");
const Comprador = require("./modelos/comprador");
const Vendedor = require("./modelos/vendedor");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
var fs = require("fs");
var path = require("path");

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

//inicio prueba mail
const nodemailer = require("nodemailer");
const req = require("express/lib/request");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, //use SSL
  auth: {
    user: "illanesm965@gmail.com",
    pass: "PRUEBAS123!@",
  },
});

var mailOptions = {
  from: "illanesm965@gmail.com",
  to: "carlos.mendizabal@ucb.edu.bo",
  subject: "Sending Email using Node.js",
  text: "That was easy!",
};
//fin prueba mail

//Mongo

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/tickets").then(() => {
    console.log("Database Connected");
  });
}

//Get eventos
app.get("/events", jsonParser, async (request, response) => {
  if (request.query.nombre) {
    try {
      var result =
        await Evento.find(/*x => x.nombre === request.query.nombre*/).exec(
          (err, docs) => {
            //console.log(typeof users.name)
            for (var i = 0, l = docs.length; i < l; i++) {
              var obj = docs[i];
              //console.log(typeof(obj))
              if (obj.nombre) {
                if (obj.nombre === request.query.nombre) {
                  response.send(obj);
                }
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

//Get eventos deprecated
//app.get('/events', async (req, res) => {
//TODO get code
//if(req.query.name){
//Get events with query name
//}else{
//Get all events
//}
//res.nombre
//res.lugar
//res.capacidad
//res.fecha
//res.precio

//res.id
//res.description
//res.lead
/* await Evento.find().then(documents=>{
      res.status(200).json(documents)
    })*/
// })

//Get datos de manager de evento
app.get("/managers", jsonParser, async (request, response) => {
  if (request.query._id) {
    try {
      var result =
        await Empresas.find(/*x => x.nombre === request.query.nombre*/).exec(
          (err, docs) => {
            //console.log(typeof users.name)
            for (var i = 0, l = docs.length; i < l; i++) {
              var obj = docs[i];
              //console.log(typeof(obj))
              if (obj._id) {
                if (obj._id === request.query._id) {
                  response.send(obj);
                }
              }
            }
          }
        );
    } catch (error) {
      response.status(500).send(error);
    }

    try {
      var result = await Empresas.findById(request.query._id).exec();
      response.send(result);
    } catch (error) {
      response.status(500).send(error);
    }
  } else {
    try {
      var result = await Empresas.find().exec();
      response.send(result);
    } catch (error) {
      response.status(500).send(error);
    }
  }
});

//Get datos de manager de evento deprecated
//app.get('/managers', async (req, res) => {
//TODO get code
//res.id
//res.name
//res.description
//res.lead
/*await Empresas.find().then(documents=>{
      res.status(200).json(documents)
    })*/
// })

//Post evento
app.post(
  "/events",
  upload.array("images", 12),
  jsonParser,
  async (request, response) => {
    try {
      var images = [];
      for (var i = 0; i < request.files; i++) {
        images.push({
          data: fs.readFileSync(
            path.join(__dirname + "/uploads/" + request.files[i].filename)
          ),
          contentType: "image/png",
        });
      }
      var evento = new Evento({
        nombre: request.body.nombre,
        lugar: request.body.lugar,
        capacidad: request.body.capacidad,
        estado: request.body.estado,
        organizador: request.body.organizador,
        fechaInicio: request.body.fechaInicio,
        fechaFin: request.body.fechaFin,
        precio: request.body.precio,
        imagenes: images,
      });
      if(request.body.fechaInicio>request.body.fechaFin){
        response.status(400).send("La fecha de inicio no puede ser mayor a la fecha en la que finaliza el evento");
      }else{
        if(request.body.fechaInicio<=request.body.fechaFin){



          if(request.body.precio<0){
            response.status(400).send("El precio no puede ser negativo");
          }else{
            if(request.body.precio>=0){

        //  if(!request.body.nombre || !request.body.fechaInicio || !request.body.fechaFin || !request.body.precio,
          //  request.body.nombre==""||request.body.fechaInicio==""||request.body.fechaFin==""||request.body.precio==""){
          //  response.status(400).send("Los campos de nombre, fecha inicial, fecha final y precio no pueden estar vacios");
         // }else{
              var result = await evento.save();
          response.send(result);

          //}


            }else{
              //no hace nada
            }
          }
          
          
          

        }else{
          //No hace nada
        }
      }
      
    } catch (error) {
      response.status(500).send(error);
    }
  }
);

//Post evento deprecated
//app.post('/events', jsonParser, (req, res, next) => {

//req.body.nombre
//req.body.lugar
//req.body.capacidad
//req.body.estado
//req.body.organizador
//req.body.fecha
//req.body.precio

//res.send('Got a POST request')

/*req.body.beginDate
    req.body.endDate*/

//TODO pasar transporter a post empresas
/*transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });*/

//})

//Put imagenes de evento deprecated
//TODO metodo oficial y agregar endpoint o campos para imagenes
//app.put('/events/images', jsonParser, (req, res, next) => {
//req.body.images
//req.body.eventName or eventId
//TODO put images of event method
// res.send('Got a PUT request')
// })

//Put estado de evento
app.put("/events", jsonParser, async (request, response) => {
  // try {
  /*  var evento = await Evento.findById(request.body._id).exec();
    //evento.set(request.body);
    evento.estado=request.body.estado
    var result = await evento.save();
    response.send(result);*/
  try {
    var result =
      await Evento.find(/*x => x.nombre === request.query.nombre*/).exec(
        (err, docs) => {
          //console.log(typeof users.name)
          for (var i = 0, l = docs.length; i < l; i++) {
            var obj = docs[i];
            var aux = JSON.stringify(obj._id);

            if (aux) {
              // console.log(request.body._id,typeof(request.body._id))
              if (aux === JSON.stringify(request.body._id)) {
                obj.estado = request.body.estado;
                console.log(obj);
                var result = obj.save();
                response.send(result);
              }
            }
          }
        }
      );
  } catch (error) {
    response.status(500).send(error);
  }

  /* } catch (error) {
    response.status(500).send(error);
  }*/
});

//Put estado de evento deprecated
//app.put('/events', jsonParser, (req, res, next) => {
//req.query.state
//req.body.eventName or eventId
//TODO post method (state = finished,scheduled,cancelled)
// res.send('Got a PUT request')
//})

//inicio borrar
/* app.get("/hello",jsonParser, (req, res, next) => {
    res.json('hello '+req.query.name);
});
rows.forEach(function(user) {

app.get("/tweets", (req, res, next) => {
      
        redis.llen(req.query.user_id, function (err, result) {
            redis.lrange(req.query.user_id, 0,result, function (err, result) {
              if (err) {
                console.error(err);
              } else {
                console.log(result); // Promise resolves to "bar"
              }
            });
          }
        });
      res.json(rows);
});*/
//fin borrar

//plantillas rest
app.get("/", (req, res) => {
  res.send("Hello World!");
});

/*app.post('/', (req, res) => {
  res.send('Got a POST request')
})*/

app.put("/user", (req, res) => {
  res.send("Got a PUT request at /user");
});

app.delete("/user", (req, res) => {
  res.send("Got a DELETE request at /user");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
