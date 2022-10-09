require('dotenv').config({ path: __dirname + '/.env' });
require('./server/connection');

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const port = process.env['PORT'];

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

app.use(express.static(path.join(__dirname, './server/views')));

app.use('/files', express.static(__dirname + '/server/uploads'));

app.get("/", (req, res) => {
    res.sendFile(path.join('/index.html'));
})

let administration = require('./server/routes/administration');
let users = require('./server/routes/users');
let specializations = require('./server/routes/specializations');
let hospitals = require('./server/routes/hospitals');
let dashboard = require('./server/routes/dashboard');

app.use(process.env['API_V1'] + "administration", administration);
app.use(process.env['API_V1'] + "users", users);
app.use(process.env['API_V1'] + "specs", specializations);
app.use(process.env['API_V1'] + "hospitals", hospitals);
app.use(process.env['API_V1'] + "dashboard", dashboard);

app.listen(port, ()=>{
    console.log(`server running on port ${port}`);
});