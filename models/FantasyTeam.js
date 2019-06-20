const mongoose = require('mongoose');
const User = require('./User.js');

const fantasyTeamSchema = new mongoose.Schema({
    match: { type: mongoose.Schema.Types.ObjectId, required: true, unique: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: false },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
})
fantasyTeamSchema.index({ match: 1, user: 1 }, { unique: true });

const FantasyTeam = mongoose.model('FantasyTeam', fantasyTeamSchema);
module.exports = FantasyTeam;