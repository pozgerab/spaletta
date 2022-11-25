import express, { json } from "express";
import sgMail from '@sendgrid/mail'
import fs from 'fs'

let subData

fs.readFile('./subs.json', 'utf8', function(err, data){
  subData = JSON.parse(data);
});

const app = express();
const PORT = 8080;

app.use(express.static('public'));
app.use( express.json() );
app.set("view engine", "ejs");

process.env.SENDGRID_API_KEY = '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';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


app.post('/sub', (req, res) => {
  let name
  if (req.query.name) {
    name = req.query.name
  } else {
    name = 'User'
  }
  const msg = {
    to: req.query.mail, // Change to your recipient
    from: 'spaletta.advent22@gmail.com', // Change to your verified sender
    subject: 'Spaletta',
    text: 'thx for subbing',
    html: `<strong>Szia ${name}!<br></br>Köszönjük hogy feliratkoztál</strong>`,
  }

  let responseMsg
  sgMail.send(msg).then(() => {console.log('Email sent')}).catch((err) => {
    responseMsg = err
    res.status(400).send({res: responseMsg}).end()
  })

  subData.push({
    name: name,
    mail: req.query.mail
  })
  fs.writeFile('./subs.json', JSON.stringify(subData), (err) => {})
  res.send(subData)
})

app.post('/notify', (req, res) => {
  let days;
  let date = new Date(Date.now()).getDate();
  if (date > 25) {
    days = 28-date;
  } else {
    days = date+(28-25)
  }
  if (req.query.to === 'all') {
    
    subData.map(user => {
      
      const msg = {
        to: user.mail, // Change to your recipient
        from: 'spaletta.advent22@gmail.com', // Change to your verified sender
        subject: 'Spaletta',
        text: 'dont forget your daily spaletta',
        html: `Kedves ${user.name}!

        Örülünk, hogy közösen készülhetünk az idei adventben!
        
        Ma egy újabb spalettát tárhatunk ki, Frizt nyomán keresve az Örömhírt saját kis világunkban.
        
        Kulcs a mai nyitáshoz:
        
        <a href='spaletta.tk#${days}'>
        
        
        Szeretettel és imával,
        Gergő, Balázs, Andris`,
      }
      sgMail.send(msg).then(data => {data.json()}).catch((err) => {
        res.status(400).send({res: err}).end()
      })
    })
  } else if (req.query.to) {
    let to = subData.find(e => (e.name === req.query.to))
    const msg = {
      to: to.mail, // Change to your recipient
      from: 'spaletta.advent22@gmail.com', // Change to your verified sender
      subject: 'Spaletta',
      text: 'dont miss your daily spaletta',
      html: `<strong>Szia ${to.name}!<br></br>Ne felejtsd el a mai spalettát kinyitni!</strong>`,
    }
    sgMail.send(msg).then(data => {data.json()}).catch((err) => {
      responseMsg = err
      res.status(400).send({res: responseMsg}).end()
    })
  }
})

app.get('/', (req, res) => {
    res.render("index")
});

app.listen(
    PORT,
    () => console.log(`its alive on http://localhost:${PORT}`)
)