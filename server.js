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
    name: 'session',
    sameSite: 'strict',
    keys: [process.env.SESSION_SECRET],
    maxAge:   2*60*60*1000
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


app.use('/',require('./controllers/authentication'))
app.use('/users',require('./controllers/users'))
app.use('/matches',require('./controllers/matches'))
app.use('/matchdata',require('./controllers/matchdata'))
app.use('/players',require('./controllers/players'))
app.use('/stats',require('./controllers/stats'))

/*
app.use('/',require('./controllers/master'))
*/
// Listen for Connections
app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`)
})