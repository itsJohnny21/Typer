const mongoose = require('mongoose')

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
})

module.exports = mongoose.model('Topic', topicSchema)