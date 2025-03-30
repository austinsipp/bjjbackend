// Modules and Globals
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const cookieSession = require('cookie-session')
const defineCurrentUser = require('./middleware/defineCurrentUser')

// Express Settings
app.use(cookieSession({
    name: 'session',/*naming this session here means that when we refer to a req.session, it refers the cookie that got sent*/
    sameSite: 'strict',
    httpOnly: true,        /*storing with this flag ensures that javascript cannot access it, important if a logged in user clicks a malicious email or has some malicious code running*/
    keys: [process.env.SESSION_SECRET],
    maxAge:   3*60*60*1000
}))
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(defineCurrentUser)

// Controllers & Routes

app.use(express.urlencoded({ extended: true }))
/*
app.use('/places', require('./controllers/places'))
app.use('/users', require('./controllers/users'))
app.use('/authentication',require('./controllers/authentication'))
*/


app.use('/api/',require('./controllers/authentication'))
app.use('/api/mobileauth',require('./controllers/mobileauth'))
app.use('/api/users',require('./controllers/users'))
app.use('/api/matches',require('./controllers/matches'))
app.use('/api/matchdata',require('./controllers/matchdata'))
app.use('/api/players',require('./controllers/players'))
app.use('/api/stats',require('./controllers/stats'))
/*app.get('/api/',(req,res) => {res.send("server is working")})*/


/*
app.use('/',require('./controllers/master'))
*/
// Listen for Connections
app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Listening on ${process.env.PORT}`)
})