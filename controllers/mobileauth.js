const router = require('express').Router()
const db = require("../models")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { sequelize } = require('../models')


const { User, Session } = db


/*
This is for mobile only. It uses json web tokens and sends 
the token back explicitly. Although often times this is done 
statelessly through having an access token sent with every 
request and a refresh token stored securely that gets used to 
generate new access tokens, I am using a stateful approach 
where I store session data in a backend session table and 
heck every api request against this. This eliminates the need 
for having two tokens and I only send one and it gets checked 
every time against the initial login created the session so I know 
exactly which username and password was used to create the 
token and thus no user can impersonate another. Mobile receives 
a jwt and client is responsible for storing it securely
and sending along with api requests. Web receives a 
cookie and then the middleware will check and if either
a valid token or valid cookie session is present then the
user session will be good to go. This is an un-orthodox
approach since most apps are trying to be stateless in
their security while this one is not at the current moment. 
A malicious user could intentionally hit the mobile auth
route on web but it wouldn't benefit them, their security 
would simply use jwt instead of cookies. The jwt would expire 
when the cookie does and every api request is still checked 
against the backend sessions table to ensure that the session 
is valid there, so they wouldn't gain anything. If a 
non-malicious web user accidentally hit this route instead 
of the web authentication, the only difference is that they 
would receive the token explicitly and likely wouldnt be able 
to handle it so they would be redirected to the login screen 
because they didn't know to pass it back in the api request. 

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
    console.log("authenticate 1")
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
        /*req.session.user_id = user.user_id*//*removed since there is no cookie on mobile*/
        let secureSession = await bcrypt.hash(String(new Date() + user.user_id), 10)
        /*req.session.session_id = secureSession*//*removed since there is no cookie on mobile*/


        const payload = { userId: user.user_id, sessionId: secureSession };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
        //req.session.roles = user.roles
        console.log(user.user_id)
        /*req.session.token = token*//*removed since there is no cookie on mobile*/
        /*currently this is susceptible to SQL injection, need to adjust slightly and make the session id not get sent back and check that the hash of the values that create it match, this way no one can put hacking SQL in*/
        /*after some thought, I think this is not susceptible to sql injection, because no one will get to this code without a valid login and it is an insert anyways*/
        await sequelize.query(`insert into public."Sessions" (session_id, user_id, token, expire_date, active_session) values ('${secureSession}', ${req.session.user_id}, '${token}', now() + interval '3' hour, 'Y')`)
        res.json({user: user, token: token})/*send the token back and the user so that the frontend can display based on the user*/
    }

})



/*
This route gets hit by the context provider on the 
frontend. Every page change or API call basically on the frontend
has the useEffect instruction to check the profile from
the session with this route to provide this to
the context for all the components on the frontend.

I basically have this route to force a middleware hit where 
I check the session data. Middleware attaches the current user 
data in req.currentUser and that simply gets sent back to the 
client here. I needed basically a filler route here to force 
a middleware hit. There is probably a better way of doing this.

As well, I have the same thing here in the mobile version and 
the web version, I think I can just get rid of the mobile 
version and have the frontend context provider hit the web 
authentication/profile as well, but I am keeping it split 
for now, something might change in the future that requires a split.

This is how the logout knows that there is not a valid session, thus
logging the user out
*/
router.get('/profile', async (req, res) => {
    //console.log("session user id from /profile path get request",req.session.userId)
    console.log("made it here")
    console.log("full page reload to homepage")
    try {
        //let user = await sequelize.query(`select T1.* from public."Users" T1 inner join public."Sessions" T2 on T1.user_id = T2.user_id and T2.session_id = '${req.session.session_id}' and T2.user_id = '${req.session.user_id}' and T2.expire_date >= now() and T2.active_session = 'Y'`)
        //console.log(user)
        /*let user = await Session.findOne({
            where: {
                user_id: req.session.user_id,
                session_id: req.session.session_id,

            }
        })*/
        console.log(req.currentUser)
        if (!(req.currentUser === null)) {
            res.json(req.currentUser)
        } else {
            res.json(null)
        }
    } catch {
        console.log("error in get authentication/profile")/*this should never get hit anymore, can probably remove this*/
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
    console.log(req.currentUser)
    console.log(req.authToken)
    console.log("logging out")
    /*this shouldnt be susceptible to sql injection because it had to pass through middleware to get here, which was sql injection resistant, but I could also use the sequelize.update method*/
    await sequelize.query(`update public."Sessions" set active_session = 'N' where user_id = '${req.currentUser.user_id}' and token = '${req.authToken}'`)
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
            res.status(400).json({ error: err })/*sends the error back to the user if there is one. Eventually I want only preset errors but it helps in development currently to send server errors to the frontend*/
        }

    }

})


module.exports = router
