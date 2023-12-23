const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/User');
const router = express.Router()
router.use(express.json());

router.get('/', (req, res) => {
    res.render('../views/signup.ejs', {
        data: req.session.data || {}
    })
})

router.post('/', async (req, res) => {
    const user = await User.findOne({
        username: req.body.username.toLowerCase()
    })

    if (user) {
        req.body.username = ''
        req.body.password = ''
        
        res.render('../views/signup.ejs', {
            data: {
                ...req.body,
                script: 'alert("Username already exists")'
            }
        })
    } else {
        console.log(req.body.password);
        const newUser = new User({
            username: req.body.username.toLowerCase(),
            password: await bcrypt.hash(req.body.password, 10),
            name: req.body.name,
            dob: req.body.dob,
            gender: req.body.gender
        })

        newUser.save()
        .then(() => {
            res.redirect(`/${newUser.username}`)
        }).catch(error => {
            console.error(error);
            res.status(500).send('Error creating new user');
        });
    }
})

module.exports = router
