const router = require('express').Router()
const { sequelize } = require('../models')


/*this gets the stats needed to make the visualizations. Queries are custom in order to match what the visualizations need exactly*/
router.get('/', async (req, res) => {
    console.log("attempting to retrieve stats")
    console.log("requesting user is:", req.session.user_id)
    try {/*there will be more charts, but right now I have only two, each of which gets its own data specifically for that graph*/
        let positionPieChartData = await sequelize.query(`
            SELECT 
            player_id,
            position_type,
            position_desc as position_desc,
            sum(duration)as duration
            FROM public.stats_view 
            where created_by = '${req.session.user_id}'
            and duration <> 0
            group by 
            player_id,
            position_type,
            position_desc
            ;`)
        let submissionPieChartData = await sequelize.query(`
            SELECT 
            player_id,
            position_type,
            position_desc,
            count(*) 
            FROM public.stats_view 
            where created_by = '${req.session.user_id}'
            and duration = 0
            group by
            player_id,
            position_type,
            position_desc
            ;`)
        console.log("positionPieChartData:", positionPieChartData)
        /*console.log("submissionPieChartData:", submissionPieChartData)*/
        res.json({
            positionPieChart: positionPieChartData,
            submissionPieChart: submissionPieChartData
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({error: err})/*eventually we want only preset error messages, but this helps in development right now*/
    }
})






module.exports = router
