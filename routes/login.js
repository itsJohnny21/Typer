const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/User');
const router = express.Router()
router.use(express.json());

router.get('/', (req, res) => {
    res.render('../views/login.ejs', {
        username: req.session.data ? req.session.data.username : '',
    })
})

router.post('/', async (req, res) => {
    if (req.body.action === 'login') {
        const user = await User.findOne({ username: req.body.username.toLowerCase() }).catch(error => {
            res.status(500).send('Error finding user')
        })

        if (!user) {
            res.render('../views/login.ejs', {
                username: req.body.username,
                script: 'alert("Username not found or password incorrect")'
            })
        } else {
            bcrypt.compare(req.body.password, user.password, (err, success) => {
                if (!success) {
                    res.render('../views/login.ejs', {
                        username: req.body.username,
                        script: 'alert("Username not found or password incorrect")'
                    })
                } else {
                    req.session.user = user
                    res.redirect(`/user/${user.username}`)
                }
            })
        }
    } else if (req.body.action === 'signup') {
        req.session.data = req.body
        res.redirect('/signup')
    }
})

module.exports = router
