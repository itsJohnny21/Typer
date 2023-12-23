const express = require('express')
require('dotenv').config()
const axios = require('axios')
const Topic = require('../models/Topic')
const router = express.Router()

router.post('/', async (req, res) => {
    const config = {
        headers: {
            Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
        }
    }

    const chatGPTTopic = {
        model: 'gpt-3.5-turbo',
        messages: [{
            role: 'user',
            content: `Input: ${req.body.topic}\n Provide a topic name for this input that is 3 words long or less. Only provide the topic name and nothing else.`
        }]
    }

    let topicName = null

    try {
        const resp = await axios.post('https://api.openai.com/v1/chat/completions', chatGPTTopic, config)
        topicName = resp.data?.choices[0]?.message.content.toLowerCase()

    } catch (error) {
        res.status(400).send('Error retrieving topic name using ChatGPT API')
    }

    let topic = await Topic.findOneAndUpdate(
        { name: topicName },
        { $inc: { count: 1 } },
        { upsert: true }

    ).catch(error => {
        console.error(error)
        res.status(500).send('Error saving topic')
    })

    if (!topic) {
        topic = new Topic({ name: topicName })
        await topic.save().catch(error => {
            console.error(error)
            res.status(500).send('Error saving new topic')
        })
        console.log('New topic:', topic)
    } else {
        console.log('Reused topic:', topic)
    }

    const chatGPTTestContent = {
        model: 'gpt-3.5-turbo',
        messages: [{
            role: 'user',
            content: `Topic: ${topicName}\n Provide a list of short interesting facts about this topic.`
        }]
    }

    console.log('req.body:\n', req.body);
    console.log('chatGPTTestContent:\n', chatGPTTestContent);
    console.log('config:\n', config);

    try {
        console.log('session:\n', req.session);
        const resp = await axios.post('https://api.openai.com/v1/chat/completions', chatGPTTestContent, config)
        const facts = resp.data?.choices[0]?.message.content
        // const facts = 'test facts'
        
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
    } catch (error) {
        console.error('Error with ChatGPT API')
        console.error(error)
        res.status(400).send('Error with ChatGPT API')
    }
})

module.exports = router