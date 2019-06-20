const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    teams: [{ name: String, logo: String }],
    startDatetime: { type: Date, required: true },
    endDatetime: { type: Date },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: false },
    winningPoints: Number
})
const Match = mongoose.model('Match', matchSchema);
module.exports = Match; 