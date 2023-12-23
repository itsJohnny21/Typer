const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const axios = require('axios')
const User = require('./models/User')
const Topic = require('./models/Topic')
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

app.get('/', async (req, res) => {
    req.session.suggestions = await (() => {
        if (!req.session.suggestions) {
            return {
                suggestion1: 'fruit',
                suggestion2: 'technology',
                suggestion3: 'sharks',
            }
        }
    }).then(async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
            }
        }
    
        const chatGPTTestContent = {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Topic: ${req.session.sugesstions.suggestion1}\n Provide a list of short interesting facts about this topic that is around 30 words long.`
            }]
        }

        await axios.post('https://api.openai.com/v1/chat/completions', chatGPTTestContent, config).then(async resp => {
            req.session.testContent = resp.data?.choices[0]?.message.content
        }).then(() => {
            res.render('index.ejs', {
                user: req.session.user || null,
                testContent: req.session.testContent,
                ...req.session.suggestions
            })
        }).catch(error => {
            res.status(400).send('Error retrieving facts using ChatGPT API')
        })
    })


    // if (!req.session.suggestions) {
    //     req.session.suggestions = {
    //         suggestion1: 'fruit',
    //         suggestion2: 'technology',
    //         suggestion3: 'sharks',
    //     }
    // }

    // const config = {
    //     headers: {
    //         Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
    //     }
    // }

    // const chatGPTTestContent = {
    //     model: 'gpt-3.5-turbo',
    //     messages: [{
    //         role: 'user',
    //         content: `Topic: ${req.session.sugesstions.suggestion1}\n Provide a list of short interesting facts about this topic that is around 30 words long.`
    //     }]
    // }

    // res.render('index.ejs', {
    //     user: req.session.user || null,
    //     testContent: req.session.topic,
    //     ...req.session.suggestions
    // })

    // await axios.post('https://api.openai.com/v1/chat/completions', chatGPTTestContent, config).then(async resp => {
    //     req.session.testContent = resp.data?.choices[0]?.message.content
    // }).then(() => {
    //     res.render('index.ejs', {
    //         user: req.session.user || null,
    //         testContent: req.session.testContent,
    //         ...req.session.suggestions
    //     })
    // }).catch(error => {
    //     res.status(400).send('Error retrieving facts using ChatGPT API')
    // })
})

app.post('/', async (req, res) => {
    if (req.body.topic) {

        // req.session.suggestions = {
        //     suggestion1: req.body.topic,
        //     suggestion2: req.session.suggestions? req.session.suggestions.suggestion1 : 'fruit',
        //     suggestion3: req.session.suggestions? req.session.suggestions.suggestion2 : 'science',
        // }

        // res.render('index.ejs', {
        //     user: req.session.user || null,
        //     testContent: req.session.topic,
        //     ...req.session.suggestions
        // })

        const config = {
            headers: {
                Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
            }
        }

        const chatGPTTopic = {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Input: ${req.body.topic}\n Provide a topic name for this input that is 3 words long or less. If the input already satisfies this then return it as is. Only provide the topic name and nothing else.`
            }]
        }
    
        await axios.post('https://api.openai.com/v1/chat/completions', chatGPTTopic, config).then(async resp => {
            topicName = resp.data?.choices[0]?.message.content.toLowerCase()
    
            await Topic.findOneAndUpdate(
                { name: topicName },
                { $inc: { count: 1 } },
                { upsert: true }
        
            ).then(async topic => {
                if (!topic) {
                    topic = new Topic({ name: topicName })
                    await topic.save().catch(error => {
                        res.status(500).send('Error saving new topic')
                    })
                }

                return topic.name
            }).then(async topicName => {
                const chatGPTTestContent = {
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'user',
                        content: `Topic: ${topicName}\n Provide a list of short interesting facts about this topic that is around 30 words long.`
                    }]
                }
        
                await axios.post('https://api.openai.com/v1/chat/completions', chatGPTTestContent, config).then(async resp => {
                    const facts = resp.data?.choices[0]?.message.content
                    
                    req.session.suggestions = {
                        suggestion1: topicName,
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

            }).catch(error => {
                console.error(error)
                res.status(500).send('Error saving topic')
            })
        
        }).catch(error => {
            res.status(400).send('Error retrieving topic name using ChatGPT API')
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