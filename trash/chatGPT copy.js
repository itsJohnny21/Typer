const express = require('express')
const { isValidRequest, createMessage, postChatGPTMessage, addMessageToConversation } = require('../utils/chatGPTUtil')
const { USER_TYPES } = require('../constants/chatGPTRoles')
const router = express.Router()

router.post('/', async (req, res) => {
    // if (!isValidRequest(req.body)) {
    //     return res.status(400).json({
    //         error: 'Invalid request'
    //     })
    // }
    // {
    //     "context": "You are my therapist, and your goal is to help me stay positive by encouraging me to pursue my goal of becoming a software engineer. You always send me messages in a positive and reassuring way.",
    //     "message": "I feel tired :("
    // }

    const { message, context, conversation = [] } = req.body
    const contextMessage = createMessage(context, USER_TYPES.SYSTEM)
    addMessageToConversation(message, conversation, USER_TYPES.SYSTEM)
    // console.log('req.body: ', req.body)
    // console.log('Generating response for:\n', message)
    const chatGPTResponse = await postChatGPTMessage(
        contextMessage,
        conversation
    )

    if (!chatGPTResponse) {
        return res.status(500).json({
            error: 'Error with ChatGPT'
        })
    }

    // const { content } = chatGPTResponse
    // addMessageToConversation(content, conversation, USER_TYPES.ASSISTANT)
    // console.log('Updated conversation:\n', conversation)

    // return res.status(200).json({
    //     message: conversation
    // })
})

module.exports = router