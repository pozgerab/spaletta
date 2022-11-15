import express from 'express';
import sgMail from '@sendgrid/mail'
import * as dotenv from 'dotenv'
dotenv.config();

process.env.SENDGRID_API_KEY = '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';

const router = express.Router();
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: 'pozgerab@gmail.com', // Change to your recipient
  from: 'pozgerab@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}

router.get('/', (req, res) => {
  /*  sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
  console.log(process.env);*/
    res.render("index", {date: new Date(Date.now()).getDate()})
});

export default router;