const router = require('express').Router()
const db = require("../models")
const bcrypt = require('bcrypt')
const { sequelize } = require('../models')


const { Event } = db





/*
This is where an user can create a match, by posting to this route with 
all the necessary fields in the request body.
*/
router.post('/add', async (req, res) => {
    console.log("match data request is:", req.body)
    console.log("requesting user is:", req.session.user_id)
    let matchInfo = JSON.parse(req.body.match_id)
    console.log("matchInfo:",matchInfo)
    console.log(req.body.event_list)
    if (/*important here, we check the role of the user session. 
        This matches what is available to an honest user on the 
        frontend, but a malicious user might hack the frontend 
        and so I make sure here that they are doing only what 
        they are allowed to do*/
        req.currentUser.roles.includes('Admin') ||
        req.currentUser.roles.includes('Gym Owner') ||
        req.currentUser.roles.includes('Professor') ||
        req.currentUser.roles.includes('Parent')
    ) {
        try {/*need to add each event in the match to the event table. It is associated with a matchID*/
            req.body.event_list.forEach(async (event_list_item) => {
                let event = await Event.create({
                    match_id: matchInfo.match_id,
                    match_time: event_list_item.match_time,
                    initiating_player: typeof (event_list_item.player) === 'undefined' ?
                        null
                        : event_list_item.player === 'left' ? matchInfo.left_player : matchInfo.right_player,
                    receiving_player: typeof (event_list_item.player) === 'undefined' ?
                    null
                    : event_list_item.player === 'left' ? matchInfo.right_player : matchInfo.left_player,
                    event_type: event_list_item.event_type,
                    event_desc: event_list_item.event_desc,
                    points_awarded: typeof (event_list_item.points_awarded) === 'undefined' ? 0 : event_list_item.points_awarded,
                    created_by: req.session.user_id
                })
                console.log(event)
            })
            res.status(200).json({ redirectTo: `${process.env.REDIRECT_URL}` })/*after submitting all the stats for a match, go back to the match creation page*/
        } catch (err) {
            console.log(err)
            res.status(503).json(null)
        }
    } else {
        res.status(403).json({/*if a user were to hack the frontend and impersonate a higher level user, this error would catch them before they could submit any stats*/
            error: 'You do not have permission to record match stats.'
        })
    }
})



module.exports = router
