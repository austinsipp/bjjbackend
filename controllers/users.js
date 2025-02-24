const router = require('express').Router()
const db = require("../models")
const bcrypt = require('bcrypt')
const { sequelize } = require('../models')


const { User } = db


router.get('/retrieveUsers', async (req, res) => {
    console.log("attempting to retrieve users")
    await User.findAll()
    try {
        //let user = await User.findAll({attributes: [first_name, last_name],})
        let user = await User.findAll()
        let usersSend = user.map((element) => element.first_name + ' ' + element.last_name)
        console.log("retrieve users response:", user)
        console.log("users names:", usersSend)
        res.json(usersSend)
    } catch {
        res.json(null)
    }
})




/*
This is where an admin can add a new user, by posting to this route with 
all the necessary fields in the request body.
*/
router.post('/add', async (req, res) => {
    console.log("new user request is:", req.body)
    console.log("requesting user is:", req.session.user_id)
    if (/*if the user hacks the frontend and impersonates a higher level user, we want the backend to make sure that the user is doing only what that user is allowed to do*/
        req.currentUser.roles.includes('Admin') ||
        (req.currentUser.roles.includes('Gym Owner') && req.body.roles.includes('Professor')) ||
        (req.currentUser.roles.includes('Gym Owner') && req.body.roles.includes('Student')) ||
        (req.currentUser.roles.includes('Parent') && req.body.roles.includes('Student'))
    ) {
        try {
            let pw_dig = await bcrypt.hash(req.body.password, 10)
            let user = await User.create({ first_name: req.body.first_name, last_name: req.body.last_name, roles: req.body.roles, username: req.body.username, password_digest: pw_dig })
            console.log(user)
            res.json(user)
        } catch {
            res.json(null)
        }
    } else {
        res.status(403).json({
            error: 'You do not have permission to create that kind of user.'
          })
    }
})



module.exports = router
