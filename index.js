import express, { json } from "express";
import fs from 'fs'
import cron from 'node-cron'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

let transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  dnsTimeOut: 100,
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASSWORD
  }
})


const job = cron.schedule('0 17 * * *', async () => {
  try {
    notify('all')
  } catch(e) {}
  console.log('Sending emails');
}, {scheduled:true, timezone: "Europe/Budapest"});
job.start()
let subData

fs.readFile('./subs.json', 'utf8', function(err, data){
  subData = JSON.parse(data);
});

const app = express();
const PORT = 8080;

app.use(express.static('public'));
app.use( express.json() );
app.set("view engine", "ejs");

app.post('/sendmail', (req, res) => {
  let msg = ''
  msg = req.body.msg;
  msg = msg.replaceAll("_", '<br></br>');
  msg = msg.replace("#","<a href=\"spaletta.tk\">spaletta.tk</a>")
  notify(req.body.to, msg);
  res.end()
});

app.post('/sub', (req, res) => {
  let name
  if (req.query.name) {
    name = req.query.name
  } else {
    name = 'User'
  }
  const mailOptions = {
    to: req.query.mail, // Change to your recipient
    from: 'spaletta.advent22@gmail.com', // Change to your verified sender
    subject: 'Spaletta',
    text: 'thx for subbing',
    html: `Köszönjük a feliratkozást, mostantól minden nap találkozunk az idei adventben!`,
  }
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) console.log(err); else console.log('Mail sent');
  })

  subData.push({
    name: name,
    mail: req.query.mail
  })
  fs.writeFile('./subs.json', JSON.stringify(subData), (err) => {})
  res.send(subData)
})

function notify(mailTo, msg) {
  if (mailTo === 'all') {
    
    let mails = subData.map(to => to.mail);
    console.log(mails)
    const mailOptions = {
      to: mails, // Change to your recipient
      from: 'spaletta.advent22@gmail.com', // Change to your verified sender
      subject: 'Spaletta',
      text: 'dont forget your daily spaletta',
      html: msg || `Kedves Spalettanyitogató!<br></br>
      Örülünk, hogy közösen készülhetünk az idei adventben!<br></br>
      
      Ma egy újabb spalettát tárhatunk ki, Fritz nyomán keresve az Örömhírt saját kis világunkban.<br></br>
      
      <a href=\"spaletta.tk\">spaletta.tk</a><br></br>
      
      Szeretettel és imával,<br></br>
      Gergő, Bazsi, Andris`,
    }
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) console.log(err); else console.log('Mail sent');
    })
  } else if (mailTo) {
    let to = subData.find(e => {return e.name === mailTo})
    const mailOptions = {
      to: to.mail, // Change to your recipient
      from: 'spaletta.advent22@gmail.com', // Change to your verified sender
      subject: 'Spaletta',
      text: 'dont forget your daily spaletta',
      html: msg || `Kedves ${to.name}!<br></br>

      Örülünk, hogy közösen készülhetünk az idei adventben!<br></br>
      
      Ma egy újabb spalettát tárhatunk ki, Fritz nyomán keresve az Örömhírt saját kis világunkban.<br></br>
      
      <a href=\"spaletta.tk\">spaletta.tk</a><br></br>
      
      Szeretettel és imával,<br></br>
      Gergő, Bazsi, Andris`,
    }
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) console.log(err); else console.log('Mail sent');
    })
  }
}

app.post('/notify', (req, res) => {
  notify(req.query.to)
  res.end()
})

app.get('/', (req, res) => {
    res.render("index")
});

app.listen(
    PORT,
    () => console.log(`its alive on http://localhost:${PORT}`)
)