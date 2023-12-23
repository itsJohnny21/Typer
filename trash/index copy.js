const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const axios = require('axios');
const User = require('./models/User')
require('dotenv').config()
const signupRouter = require('./routes/signup')
const loginRouter = require('./routes/login')
const usersRouter = require('./routes/users')
const topicRouter = require('./routes/topic')
const bodyParser = require('body-parser')

const app = express()
app.use(express.urlencoded({ extended: false }))
mongoose.connect('mongodb+srv://jsalazar6421:Bonita6421!@johnnycluster.vttyxf3.mongodb.net/')

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use(bodyParser.json())
const chatGPTRoutes = require('./routes/chatGPT')
const { number } = require('yup')
app.use('/chatGPT', chatGPTRoutes)

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Internal Server Error')
})

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index.ejs', {
        user: req.session.user || null,
        testContent: 'default content',
    })
})

app.post('/', async (req, res) => {
    if (req.body.action === 'login') {
        res.redirect('/login')

    } else if (req.body.action === 'logout') {
        req.session.destroy()
        res.redirect('/')
    } 
})

app.use('/signup', signupRouter)
app.use('/login', loginRouter)
app.use('/users', usersRouter)
app.use('/add-topic', topicRouter)

app.get('/:username', async (req, res) => {
    if (req.session.user && req.session.user.username === req.params.username) {
        res.render('userProfile', { user: req.session.user })

    } else {
        req.session.data = req.params
        res.redirect('/login')
    }
})

app.listen(3000, () => {
    console.log('http://localhost:3000')
})