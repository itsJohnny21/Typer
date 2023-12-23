const express = require('express')
const Topic = require('../models/Topic');
const { render } = require('express/lib/response');
const router = express.Router()
router.use(express.json());

// router.post('/', (req, res) => {
//     const topic = Topic.findOneAndUpdate(
//         { name: req.body.name },
//         { $inc: { count: 1 } },
//         { upsert: true }
//     )
//     .catch(error => {
//         console.error(error)
//         res.status(500).send('Error saving topic')
//     })

//     if (!topic) {
//         const newTopic = new Topic({
//             name: req.body.name,
//             count: 0
//         })

//         newTopic.save().catch(error => {
//             console.error(error)
//             res.status(500).send('Error saving new topic')
//         })
//     }

//     res.render('../views/index.ejs')
// })

module.exports = router
