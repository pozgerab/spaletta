import express, { json } from "express";
import sgMail from '@sendgrid/mail'
import fs from 'fs'
import cron from 'node-cron'

const scheduleJob = cron.schedule('0 17 * * *', () => {
  fetch('/notify?to=all').then(data => data.json()).catch(err => console.log(err));
  console.log('Sending emails');
});

scheduleJob.start();

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
  console.log(req.query.mail);
  const msg = {
    to: req.query.mail, // Change to your recipient
    from: 'spaletta.advent22@gmail.com', // Change to your verified sender
    subject: 'Spaletta',
    text: 'thx for subbing',
    html: `Köszi a feliratkozást, mostantól minden nap találkozunk az idei adventben!`,
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
  if (req.query.to === 'all') {
    
    subData.map(to => {
      const msg = {
        to: to.mail, // Change to your recipient
        from: 'spaletta.advent22@gmail.com', // Change to your verified sender
        subject: 'Spaletta',
        text: 'dont forget your daily spaletta',
        html: `Kedves ${to.name}!<br></br>

        Örülünk, hogy közösen készülhetünk az idei adventben!<br></br>
        
        Ma egy újabb spalettát tárhatunk ki, Frizt nyomán keresve az Örömhírt saját kis világunkban.<br></br>
        
        Kulcs a mai nyitáshoz:<br></br>
        
        <a href='spaletta.tk'><a><br></br>
        
        
        Szeretettel és imával,<br></br>
        Gergő, Bazsi, Andris`,
      }
      sgMail.send(msg).then(data => {data.json()}).catch((err) => {
        res.status(400).send({res: err}).end()
      })
    })
  } else if (req.query.to) {
    let to = subData.find(e => {return e.name === req.query.to})
    const msg = {
      to: to.mail, // Change to your recipient
      from: 'spaletta.advent22@gmail.com', // Change to your verified sender
      subject: 'Spaletta',
      text: 'dont forget your daily spaletta',
      html: `Kedves ${to.name}!<br></br>

      Örülünk, hogy közösen készülhetünk az idei adventben!<br></br>
      
      Ma egy újabb spalettát tárhatunk ki, Frizt nyomán keresve az Örömhírt saját kis világunkban.<br></br>
      
      Kulcs a mai nyitáshoz:<br></br>
      
      <a href='spaletta.tk'><a><br></br>
      
      Szeretettel és imával,<br></br>
      Gergő, Bazsi, Andris`,
    }
    sgMail.send(msg).then(data => {data.json()}).catch((err) => {
      res.status(400).send({res: err}).end()
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