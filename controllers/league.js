
const boom = require('boom')
const Match = require('../models/Match');
const Player = require('../models/Player');
const FantasyTeam = require('../models/FantasyTeam');


exports.getMatches = (req, res, next) => {

    Match.find().populate('players').populate('winner', 'name email').exec((err, matches) => {
        if (err) { return next(boom.badImplementation(err)); }
        res.status(200).json(matches)
    });
};

exports.getFantasyTeams = (req, res, next) => {
    FantasyTeam.find({ "user": req.user.id }).populate('players').exec((err, matches) => {
        if (err) { return next(boom.badImplementation(err)); }
        res.status(200).json(matches)
    });
};

exports.getPlayers = (req, res, next) => {
    let { players } = req.body;
    Player.find({
        "_id": { $in: players }
    }, (err, playersData) => {
        if (err) {
            if (err.name == 'CastError')
                return next(boom.badData("One or More players not found"))
            return next(boom.badImplementation(err))
        }
        res.status(200).json(playersData)
    })
}


exports.createFantasyTeam = (req, res, next) => {
    let { players, match } = req.body;
    Player.find({
        "_id": { $in: players }
    }, (err, playersData) => {
        if (err) {
            if (err.name == 'CastError')
                return next(boom.badData("One or More players not found"))
            return next(boom.badImplementation(err))
        }
        Match.findOne({
            "_id": match
        }, (err, matchData) => {
            if (err) {
                if (err.name == 'CastError')
                    return next(boom.badData("Match not found"))
                return next(boom.badImplementation(err))
            }
            let now = new Date()
            let matchStartTime = new Date(match.startDatetime)

            if (now >= matchStartTime)
                return next(boom.badRequest("The Match has already started. You cannot create team now."))
            let fantasyTeam = new FantasyTeam({
                players: players,
                user: req.user.id,
                match: match
            })
            fantasyTeam.save((err) => {
                if (err) {
                    if (err.code == 11000)
                        return next(boom.badRequest("You have already created a team for this match."))
                    return next(boom.badImplementation(err))
                }
                res.status(200).json(fantasyTeam)
            })
        })

    })
};


exports.updateFantasyTeam = (req, res, next) => {
    let { players, team } = req.body;

    FantasyTeam.findOne({
        "_id": team
    }, (err, teamData) => {
        if (err) {
            if (err.name == 'CastError')
                return next(boom.badData("Team not found"))
            return next(boom.badImplementation(err))
        }
        if (teamData.user != req.user.id)
            return next(boom.badData("Team not found for user"))

        Player.find({
            "_id": { $in: players }
        }, (err, playersData) => {
            if (err) {
                if (err.name == 'CastError')
                    return next(boom.badData("One or More players not found"))
                return next(boom.badImplementation(err))
            }
            FantasyTeam.findByIdAndUpdate(
                team, {
                    players: players
                }, { new: true }, (err, teamData) => {
                    if (err)
                        return next(boom.badImplementation(err))
                    res.status(200).json(teamData);
                })
        })
    })
};
