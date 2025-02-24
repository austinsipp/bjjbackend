const router = require('express').Router()
const db = require("../models")
const bcrypt = require('bcrypt')
const { sequelize } = require('../models')


const { User, Session } = db


/*
This route is for verifying the username and password 
combination given by a user on the login screen.
It checks the user table and finds the record with
the encrypted password that matches that username. Then
using bcrypt it compares the given password to the 
encrypted password. It does this by taking the salt
from the encrypted password_digest, then adding it to
the user submitted password and hashing this combo to 
see if it matches the password_digest.

It also starts the cookie session, which gets sent back 
to the frontend and is stored in the browsers cookies. 
This stores some data, like the username that then 
persists for 2 hours on the frontend. However, I found
that doing this there was no way for a user to safely 
logout, they woudl simply have to wait for their cookie 
to expire. This is why it also creates a record in the
Sessions table, with an expiration date and a flag for
session validity. To implement logout, I had to 
change the flag for the user's session in this backend
table. That way, even though they have a valid cookie
they still get rejected because the backend is tracking
their session, so I can simply invalidate their session
and they will have safely logged off.
*/

router.post('/', async (req, res) => {
    console.log("authenticate 1", req.session.session_id)
    let user = await User.findOne({
        where: { username: req.body.username }
    })
    //console.log(user)
    if (!user || !await bcrypt.compare(req.body.password, user.password_digest)) {
        console.log("authenticate 2")
        res.status(404).json({
            message: 'Could not find a user with the provided username and password'
        })
    } else {
        console.log("authenticate 3")
        req.session.user_id = user.user_id
        let secureSession = await bcrypt.hash(String(new Date() + req.session.user_id), 10)
        req.session.session_id = secureSession
        /*const secureSession = await Session.create({
            session_id: await bcrypt.hash(),
            user_id: req.session.user_id,
            expire_date: ,
            active_session: 'Y'
        })*/
        /*currently this is susceptible to SQL injection, need to adjust slightly and make the session id not get sent back and check that the hash of the values that create it match, this way no one can put hacking SQL in*/
        await sequelize.query(`insert into public."Sessions" (session_id, user_id, expire_date, active_session) values ('${secureSession}', ${req.session.user_id}, now() + interval '1' hour, 'Y')`)
        //req.session.roles = user.roles
        console.log(user.user_id)
        res.json({ user })
    }

})



/*
This route gets hit by the context provider on the 
frontend. Every page change or API call basically on the frontend
has the useEffect instruction to check the profile from
the session with this route to provide this to
the context for all the components on the frontend.

The important thing to note is that it checks both
that the user id from the session cookie is valid
but also the backend session tracking table must
have a valid session. This is how the logout 
knows that there is not a valid session, thus
logging the user out
*/
router.get('/profile', async (req, res) => {
    //console.log("session user id from /profile path get request",req.session.userId)
    console.log("made it here")
    console.log("full page reload to homepage")
    try {
        let user = await sequelize.query(`select T1.* from public."Users" T1 inner join public."Sessions" T2 on T1.user_id = T2.user_id and T2.session_id = '${req.session.session_id}' and T2.user_id = '${req.session.user_id}' and T2.expire_date >= now() and T2.active_session = 'Y'`)
        console.log(user)
        /*let user = await Session.findOne({
            where: {
                user_id: req.session.user_id,
                session_id: req.session.session_id,

            }
        })*/
        if (user[0].length) {
            res.json(user[0][0])
        } else {
            res.json(null)
        }
    } catch {
        console.log("error in get authentication/profile")
        res.json(null)
    }
    //res.json(req.currentUser)
})

/*
This is the route that gets used when a user confirms 
that they want to logout. It simply updatesd the backend
session to be no longer an active session. This way,
even though the user's browser will still have a 
valid cookie session running, this second check from 
the sessions table will fail and they will be logged
out if they have hit this route and cause that flag to update.
*/
router.post('/logout', async (req, res) => {
    console.log(req.session)
    console.log("logging out")
    await sequelize.query(`update public."Sessions" set active_session = 'N' where user_id = '${req.session.user_id}' and session_id = '${req.session.session_id}'`)
    //req.logOut()
    //res.session.expires = '2022-09-09T00:14:27.349Z'
    //req.session.cookie.expires = new Date(0)
    //req.session.cookie.maxAge = 0
    /*res.status(200).clearCookie('connect.sid', {
        path: '/'
    })*/
    /*req.session.destroy(function (err) {
        res.redirect('/')
    })*/
    //req.clearCookie('connect.sid');

    //res.session = null
    //res.redirect('/')
    res.status(200).json(null)
    //res.redirect(200,'/').json(null)
    //res.send('You have been successfully logged out!')
})


router.post('/changepassword', async (req, res) => {
    console.log('Change Password Attempted')
    console.log(req.body)
    console.log(req.session)
    console.log(req.currentUser)
    let user = await User.findOne({
        where: { username: req.currentUser.username }
    })
    
    if (!user || !await bcrypt.compare(req.body.current, user.password_digest)) {
        res.status(404).json({
            error: 'Current password must be correct to change the password'
        })
    } else if (req.body.new !== req.body.confirm) {/*this was checked on the frontend and submission without matching shouldnt be possible, but if it somehow happens, the backend will catch it here*/
        res.status(400).json({
            error: 'New passwords submitted must match'
        })
    } else {
        try {
            console.log('got here 1')
            let pw_dig = await bcrypt.hash(req.body.new, 10)/*encrypt password*/
            console.log('got here 2')
            console.log('changing password for username:', req.currentUser.username)
            let changed = await User.update(
                { password_digest: pw_dig },
                { where: { username: req.currentUser.username } }
            )/*updates the password to the new encrypted password*/
            console.log('got here 3')
            console.log(changed)
            res.json(changed)
        }
        catch (err) {
            console.log(err)
            res.status(400).json({error: err})/*sends the error back to the user if there is one. Eventually I want only preset errors but it helps in development currently to send server errors to the frontend*/
        }

    }

})


module.exports = router
