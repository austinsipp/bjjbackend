const router = require('express').Router()
const db = require("../models")
const { sequelize } = require('../models')

const { User, Session } = db


/*
Middleware gets run before every single request that gets sent 
to the backend. In this case, what we are doing is checking the 
user and session from the cookie and validating that they are
good to go. Meaning that the session user_id must be an actual user
in the user table, and the session id is a valid session listed in 
the session table. Then this gets passed on after running via 
the next() function that gets used in middleware.
*/
async function defineCurrentUser(req, res, next) {
    //console.log("req:",req)
    console.log("req.headers:", req.headers)
    const token = req.headers['authorization']?.split(' ')[1].replace(/^['"]|['"]$/g, '')
    console.log("token:", token)
    console.log("typeof token:", typeof token)
    const mobile = !(token === undefined) /*if token exists then treat as mobile, otherwise treat as web*/
    /*const mobile = true*/ /*force to interpret as mobile for testing*/
    console.log("mobile?", mobile)
    if (mobile) {/*this is what we do if it is mobile, use the jwt*/
        let sessionData
        if (token === undefined) {
            console.log("no token supplied, assume user has not logged in yet")
        }
        else {
            /*use the findOne method to defend against sql injection*/
            /*let session = await Session.findOne({
                where: { token: token }
            })*/

            /*for some reason when I use the findOne above it tries 
            to pull  some column called id, which doesnt exist. I 
            cannot figure out why since this is neither in my models 
            nor migrations nor the database, but the findOne method 
            tries to pull that column, doesnt find it, and erros out, 
            so we have to do it this way for now. Need to change this 
            somehow eventually to avoid sql injection*/
            console.log("validating session in middleware")
            let session = await sequelize.query(`select * from public."Sessions" where token = '${token}' and expire_date >= now() and active_session = 'Y'`)
            sessionData = session/*need a variable with bigger scope for this to pass to the next few lines*/
            console.log("middleware session:", session)


        }

        try {
            /*let user = await sequelize.query(`select * from public.Users where user_id = ${session.user_id}`)*/
            let user = await User.findOne({
                where: { user_id: sessionData[0][0].user_id }
            })
            console.log("session validated setting current user")
            console.log(user)
            req.currentUser = user.dataValues/*store the currentUser in req.currentUser, this will get used in the /profile route as well as others*/
            req.authToken = token/*store the token to be used in subsequent routes. Currently only the logout route uses this and I think that is the only one that needs it*/
            console.log("user assigned during middleware was", req.currentUser)
            next()
        }
        catch (err) {
            console.log("no user exists with that supposedly valid session")
            //console.log(err)
            req.currentUser = null/*if no session is validated, pass null to req.currentUser*/
            next()

        }
    } else {/*if it is web, then use the cookie session to validate*/
        console.log("middleware says ", req.session)
        /*console.log("session typeof:", typeof req.session)
        console.log("session userid typeof:", typeof req.session.user_id)
        console.log("session sessionid typeof:", typeof req.session.session_id)
        console.log(req.session.user_id === undefined || req.session.session_id === undefined)*/
        let sessionData
        if (req.session.user_id === undefined || req.session.session_id === undefined) {
            console.log("no session or no user in cookie, assume user has not logged in yet")
            /*next()*//*assign null user and pass null as the user. If this is the context provider on the frontend hitting authentication/profile, then the user will be null and it will display the login screen*/
            /*had next()here but this gave me an error saying that at a later step that I tried to send a respone but it had already been sent, so it is simply wrong to put next() here because it tries to pass control to the next code, it doesnt just go to the code below like it should*/
        } else {
            /*use the findOne method to defend against sql injection*/
            /*let session = await Session.findOne({
                where: {
                    user_id: req.session.user_id,
                    session_id: req.session.session_id
                }
            })*/
            /*for some reason when I use the findOne above it tries 
            to pull  some column called id, which doesnt exist. I 
            cannot figure out why since this is neither in my models 
            nor migrations nor the database, but the findOne method 
            tries to pull that column, doesnt find it, and erros out, 
            so we have to do it this way for now. Need to change this 
            somehow eventually to avoid sql injection*/
            console.log("validating session in middleware")
            let session = await sequelize.query(`select * from public."Sessions" where session_id = '${req.session.session_id}' and user_id = '${req.session.user_id}' and expire_date >= now() and active_session = 'Y'`)
            sessionData = session/*need a variable with bigger scope for this to pass to the next few lines*/
            console.log("middleware session:", session)
            /*console.log("middleware session user id:",session[0][0].user_id)*//*this will error out if there is no session and thus no user id, thus should only be uncommented for some testing*//*note that when you use sequelize.query you need to pick the [0][0] from your results but when you use find or findOne you need to use dataValues*/
        }

        try {
            console.log("middleware session user id 2:", sessionData[0][0].user_id)
            const userFilter = sessionData[0][0].user_id
            console.log("userFilter:", userFilter)
            /*let user = await sequelize.query(`select * from public.Users where user_id = ${session.user_id}`)*/
            let user = await User.findOne({
                where: { user_id: userFilter }
            })
            console.log("session validated setting current user")
            console.log(user)
            /*req.currentUser = user[0][0]*//*store the currentUser in req.currentUser, this will get used in the /profile route as well as others*/
            req.currentUser = user.dataValues/*note that when you use sequelize.query you need to pick the [0][0] from your results but when you use find or findOne you need to use dataValues*/
            console.log("user assigned during middleware was", req.currentUser)
            next()
        }
        catch (err) {
            console.log("no user exists with that session")
            console.log("error:", err)
            //console.log(err)
            req.currentUser = null/*if no session is validated, pass null to req.currentUser*/
            next()
        }

    }
}

module.exports = defineCurrentUser