const express = require('express')
require('dotenv').config()
const axios = require('axios')
const yup = require('yup')
const { isValidRequest, createMessage, postChatGPTMessage, addMessageToConversation } = require('../utils/chatGPTUtil')
const { USER_TYPES } = require('../constants/chatGPTRoles')
const router = express.Router()

router.post('/', async (req, res) => {

    const message = `Topic: ${req.body.action}\n Could you provide a list of facts about this topic? I need the facts to be a total of 200 words.`

    const chatGPTData = {
        model: 'gpt-3.5-turbo',
        messages: [{
            role: 'user',
            content: 'Say this is a test!'
        }]
    }

    const config = {
        headers: {
            Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
        }
    }

    console.log(chatGPTData);
    console.log(config);

    try {
        const testContent = await axios.post('https://api.openai.com/v1/chat/completions', chatGPTData, config).data?.choices[0]?.message.content
        res.render('../views/index.ejs', {
            user: req.session.user || null,
            testContent: testContent,
        })
    } catch (error) {
        console.error('Error with ChatGPT API')
        console.error(error)
        res.status(400).send('Error with ChatGPT API')
    }
})

module.exports = router