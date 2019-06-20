const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    avatar: { type: String, required: true }
})
const Player = mongoose.model('Player', playerSchema);

module.exports = Player;