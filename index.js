import express from "express";

import calendar from "./routes/calendar.js";

const app = express();
const PORT = 8080;

app.use(express.static('public'));
app.use( express.json() );
app.set("view engine", "ejs");

app.use('/calendar', calendar);

app.listen(
    PORT,
    () => console.log(`its alive on http://localhost:${PORT}`)
)