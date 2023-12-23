const express = require('express')
const User = require('../models/User')
const router = express.Router()
router.use(express.json());

router.post('/user/', (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        gender: req.body.gender
    })

    user.save().then(() => {
        console.log(user)
        res.render('../views/users.ejs')
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error saving user');
    })
})

module.exports = router
