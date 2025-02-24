const router = require('express').Router()
const db = require("../models")
const bcrypt = require('bcrypt')

const { Player } = db


/*this route finds all the players that the current user has created. These are the ones they are allowed to take stats for*/
router.get('/retrievePlayers', async (req, res) => {
    console.log("attempting to retrieve players")
    console.log("requesting user is:", req.session.user_id)
    /*await User.findAll()*/
    try {
        //let user = await User.findAll({attributes: [first_name, last_name],})
        let player = await Player.findAll({
            where: {
                created_by: req.session.user_id  //*filter for only players created by the user in question*/
            }
          })
        let playersSend = player.map((element) => element.player_name + ' ' + element.player_school + ' ' + element.player_belt)
        console.log("retrieve players response:", player)
        console.log("players names:", playersSend)
        res.json(player)
    } catch (err) {
        console.log(err)
        res.status(400).json({error: err})/*sends the error to the frontend, eventually we dont want to do this, but it helps right now with development if I break something to see immediately what it was*/
    }
})

router.post('/add', async (req, res) => {
    console.log("new player request is:", req.body)
    console.log("requesting user is:", req.session.user_id)
    if (
        req.currentUser.roles.includes('Parent') 
    ) {
        try {
            let player = await Player.create({ 
                player_name: req.body.player_name, 
                player_school: req.body.player_school, 
                player_belt: req.body.player_belt, 
                created_by: req.session.user_id, 
                created_date: new Date() })
            console.log(player)
            res.json(player)
        } catch (err) {
            console.log(err)
            res.status(400).json({error: err})
        }
    } else {/*Should only come up if the user was able to hack the frontend to impersonate a higher level user, the backend will still check and make sure they are allowed to do this and let the client know if they are not*/
        res.status(403).json({
            error: 'You do not have permission to create players.'
          })
    }
})

module.exports = router