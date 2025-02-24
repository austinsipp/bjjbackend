const router = require('express').Router()
const db = require("../models")
const bcrypt = require('bcrypt')
const { sequelize } = require('../models')


const { Match } = db


/*
This is where an user can create a match, by posting to this route with 
all the necessary fields in the request body.
*/
router.post('/add', async (req, res) => {
    console.log("match request is:", req.body)
    console.log("requesting user is:", req.session.user_id)
    console.log("matchtype:",req.body.matchType)
    console.log("leftPlayerID:",req.body.leftPlayerID)
    console.log("rightPlayerID:",req.body.rightPlayerID)
    console.log(Date.now())
    if (/*important here, we check the role of the user session. 
        This matches what is available to an honest user on the 
        frontend, but a malicious user might hack the frontend 
        and so I make sure here that they are doing only what 
        they are allowed to do*/
        req.currentUser.roles.includes('Admin') ||
        req.currentUser.roles.includes('Gym Owner') ||
        req.currentUser.roles.includes('Professor')  ||
        req.currentUser.roles.includes('Parent') 
    ) {
        try {/*creates a new match with a unique matchID*/
            let match = await Match.create({ 
                match_type: req.body.matchType, 
                rule_set: req.body.ruleSet,
                left_player: req.body.leftPlayerID, 
                right_player: req.body.rightPlayerID, 
                date_of_match: new Date(), 
                match_desc: '', 
                assoc_spec_event: '', 
                created_by: req.session.user_id })
                /*records who created the match. All the 
                data in the app currently is inteded to be 
                stored with a refrence to the user who 
                created it. I want folks to be able to 
                see any data they created. Beyond that, 
                some users eventually will be able to see 
                data created by others, such as gym owners
                being able to see stats taken by their 
                professors, but I am not there yet*/
            console.log(match)
            res.json(match)
        } catch (err) {
            console.log(err)
            res.status(503).json(null)
        }
    } else {
        res.status(403).json({/*Should only come up if the user was able to hack the frontend to impersonate a higher level user, the backend will still check and make sure they are allowed to do this and let the client know if they are not*/
            error: 'You do not have permission to record match stats.'
          })
    }
})



module.exports = router
