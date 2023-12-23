const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const axios = require('axios')
const User = require('./models/User')
const Topic = require('./models/Topic')
const Search = require('./models/Search')
const signupRouter = require('./routes/signup')
const loginRouter = require('./routes/login')
const usersRouter = require('./routes/users')
const topicRouter = require('./routes/topic')
const chatGPTRouter = require('./routes/chatGPT')
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(express.urlencoded({ extended: false }))
mongoose.connect('mongodb+srv://jsalazar6421:Bonita6421!@johnnycluster.vttyxf3.mongodb.net/')
app.use(express.static('./views'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
    })
)

app.use(bodyParser.json())
const { number } = require('yup')
app.set('view engine', 'ejs')

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Internal Server Error')
})

app.use('/signup', signupRouter)
app.use('/login', loginRouter)
app.use('/users', usersRouter)
app.use('/add-topic', topicRouter)
app.use('/chatGPT', chatGPTRouter)

app.get('/admin/deletealltopics', async (req, res) => {
    try {
        await Topic.deleteMany({})
        res.send('All topic data deleted successfully.')
    } catch (error) {
        res.status(500).send('Error deleting topic data.')
    }
})

app.get('/admin/deleteallusers', async (req, res) => {
    try {
        await User.deleteMany({})
        res.send('All user data deleted successfully.')
    } catch (error) {
        res.status(500).send('Error deleting user data.')
    }
})

app.get('/', async (req, res) => {
    if (!req.session.suggestions) {
        req.session.suggestions = {
            suggestion1: 'fruit',
            suggestion2: 'technology',
            suggestion3: 'sharks',
        }
    }

    let TEST_CONTENT = 'the quick brown fox jumps over the lazy dog. i like blueberries because they are healthy and full of antioxidants. orcas are the largest species of dolphin. they are apex predators and are found in all oceans.'
    module.exports.TEST_CONTENT = TEST_CONTENT

    res.render('index.ejs', {
        user: req.session.user || null,
        testContent: 'the quick brown fox jumps over the lazy dog. i like blueberries because they are healthy and full of antioxidants. orcas are the largest species of dolphin. they are apex predators and are found in all oceans.',
        ...req.session.suggestions
    })
})

// app.get('/', async (req, res) => {
//     if (!req.session.suggestions) {
//         req.session.suggestions = {
//             suggestion1: 'fruit',
//             suggestion2: 'technology',
//             suggestion3: 'sharks',
//         }
//     }

//     const config = {
//         headers: {
//             Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
//         }
//     }


//     const chatGPTTestContent = {
//         model: 'gpt-3.5-turbo',
//         messages: [{
//             role: 'user',
//             content: `Topic: ${req.session.suggestions.suggestion1}\n Provide a list of short interesting facts about this topic that is around 30 words long.`
//         }]
//     }

//     await axios.post('https://api.openai.com/v1/chat/completions', chatGPTTestContent, config).then(async resp => {
//         req.session.testContent = resp.data?.choices[0]?.message.content
//     }).then(() => {
//         res.render('index.ejs', {
//             user: req.session.user || null,
//             testContent: req.session.testContent,
//             ...req.session.suggestions
//         })
//     }).catch(error => {
//         res.status(400).send('Error retrieving facts using ChatGPT API')
//     })
// })

app.post('/', async (req, res) => {
    const config = {
        headers: {
            Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
        }
    }

    if (req.body.topic) {
        req.body.topic = req.body.topic.trim().toLowerCase()

        const search = new Search({ name: req.body.topic })

        await search.save().catch(error => {
            res.status(500).send('Error saving search')
        })

        let topic = null
        
        if (req.body.topic.split(' ').length <= 3) {
            topic = await Topic.findOneAndUpdate(
                { name: req.body.topic },
                { $inc: { count: 1 } },
                { upsert: false }
    
            ).catch(error => {
                res.status(500).send('Error finding/updating topic')
            })

            if (!topic) {
                topic = new Topic({ name: req.body.topic })
            }
        } else {
            const chatGPTTopic = {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Input: ${req.body.topic}\n Provide a topic name for this input that is 3 words long or less. If the input already satisfies this then return it as is. Only provide the topic name and nothing else.`
                }]
            }

            await axios.post('https://api.openai.com/v1/chat/completions', chatGPTTopic, config).then(async resp => {
                const topicName = resp.data?.choices[0]?.message.content.toLowerCase()

                topic = await Topic.findOneAndUpdate(
                    { name: topicName },
                    { $inc: { count:1 } },
                    { upsert: false }

                ).catch(error => {
                    res.status(500).send('Error finding/updating topic')
                })

                if (!topic) {
                    topic = new Topic({ name: topicName })
                }
            }).catch(error => {
                res.status(400).send('Error retrieving topic name using ChatGPT API')
            })
        }

        await topic.save().catch(error => {
            res.status(500).send('Error saving new topic')
        })

        const chatGPTTestContent = {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Topic: ${topic.name}\n Provide a list of short interesting facts about this topic that is around 30 words long.`
            }]
        }

        await axios.post('https://api.openai.com/v1/chat/completions', chatGPTTestContent, config).then(async resp => {
            const facts = resp.data?.choices[0]?.message.content
            
            req.session.suggestions = {
                suggestion1: topic.name,
                suggestion2: req.session.suggestions? req.session.suggestions.suggestion1 : 'fruit',
                suggestion3: req.session.suggestions? req.session.suggestions.suggestion2 : 'science',
            }

            res.render('../views/index.ejs', {
                user: req.session.user || null,
                testContent: facts,
                ...req.session.suggestions
            })

        }).catch(error => {
            res.status(400).send('Error retrieving facts using ChatGPT API')
        })

    } else if (req.body.action) {
        if (req.body.action === 'login') {
            res.redirect('/login')
    
        } else if (req.body.action === 'logout') {
            req.session.destroy()
            res.redirect('/')
        }
    }
})

app.get('/user/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username }).catch(error => {
        res.status(500).send('Error finding user')
    })

    if (user) {
        res.render('userProfile', { user: user })
        
    } else {
        req.session.data = req.params
        res.redirect('/login')
    }
})

app.listen(3000, () => {
    console.log('http://localhost:3000')
})