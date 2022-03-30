//Express config (localhost:3000)
const express = require('express')
const app = express()
const port = 3000

const mongoose = require('mongoose')
const Evento = require('./modelos/evento')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

//inicio prueba mail
const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, //use SSL
    auth: {
      user: 'illanesm965@gmail.com',
      pass: 'PRUEBAS123!@'
    }
  })

  var mailOptions = {
    from: 'illanesm965@gmail.com',
    to: 'carlos.mendizabal@ucb.edu.bo',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };
//fin prueba mail

//Mongo

main().catch((err) => console.log(err))

async function main() {
    await mongoose.connect('mongodb://localhost:27017/tickets').then(() => {
        console.log('Database Connected')
    })
}

//Get Events
app.get('/events', async (req, res) => {
    //TODO get code
    //if(req.query.name){
        //Get events with query name
    //}else{
        //Get all events
    //}
    //res.id
    //res.name
    //res.description
    //res.lead
    await Evento.find().then(documents=>{
      res.status(200).json(documents)
    })
  })

//Get Event Manager Data
app.get('/managers', async (req, res) => {
    //TODO get code
    //res.id
    //res.name
    //res.description
    //res.lead
    await Empresa.find().then(documents=>{
      res.status(200).json(documents)
    })
  })

//Post Event
app.post('/events', jsonParser, (req, res, next) => {
    /*req.body.beginDate
    req.body.endDate
    req.body.eventName
    req.body.price
    req.body.user*/
    //TODO post event method
    //TODO sent mail method
    
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
    //res.send('Got a POST request')
  })

  //Post Images of Event
app.post('/events/images', jsonParser, (req, res, next) => {
    //req.body.images
    //req.body.eventName or eventId
    //TODO post images of event method
    res.send('Got a POST request')
  })

  //Cancel Event
app.post('/events', jsonParser, (req, res, next) => {
    //req.query.state
    //req.body.eventName or eventId
    //TODO post method (state = finished,scheduled,cancelled)
    res.send('Got a POST request')
  })

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

//Rest Templates
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', (req, res) => {
  res.send('Got a POST request')
})

app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user')
})
  
app.delete('/user', (req, res) => {
  res.send('Got a DELETE request at /user')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})