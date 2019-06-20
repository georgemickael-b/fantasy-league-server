
const boom = require('boom')
const Player = require('../models/Player');
const FantasyTeam = require('../models/FantasyTeam');
const Match = require('../models/Match');


exports.chooseWinner = (req, res, next) => {
    let { pointsOfPlayers, match } = req.body;
    let maxPoints = 0;
    let winner = null;


    Match.findById(match, function (err, match) {
        if (err) { return next(boom.badImplementation(err)); }
        for (let player of pointsOfPlayers) {
            let playerInMatch = match.players.find((p) => p == player.id)
            if (!playerInMatch)
                return next(boom.badData("One or more players point is missing"))
        }
        FantasyTeam.find({ "match": match }).exec((err, teams) => {
            if (err) { return next(boom.badImplementation(err)); }
            for (let team of teams) {

                let points = team.players.reduce((point, player) => {
                    console.log(player)
                    let pointPlayer = pointsOfPlayers.find((p) => p.id == player)
                    return point + pointPlayer.points
                }, 0)
                console.log(points)
                if (points > maxPoints) {
                    maxPoints = points;
                    winner = team.user;
                }
            }
            if (!winner)
                return next(boom.badRequest("No Winner"))
            let data = { winner: winner, winningPoints: maxPoints }
            Match.findByIdAndUpdate(match, data, { new: true }, function (err, match) {
                if (err) return next(boom.badRequest(err))
                return res.status(200).send(match);
            });
        });
    });
}

exports.createPlayer = (req, res, next) => {
    let { name, avatar } = req.body
    let player = new Player({
        name: name,
        avatar: avatar
    })
    player.save((err) => {
        if (err) { return next(boom.badImplementation(err)); }
        res.json(player)
    });
};

exports.getAllPlayers = (req, res, next) => {

    Player.find({}, (err, players) => {
        if (err) { return next(boom.badImplementation(err)); }
        res.json(players)
    });
}

exports.createMatch = (req, res, next) => {
    let { players, startDatetime } = req.body;
    Player.find({
        "_id": { $in: players }
    }, (err, playersData) => {
        if (err) {
            if (err.name == 'CastError')
                return next(boom.badData("One or More players not found"))
            return next(boom.badImplementation(err))
        }

        let match = new Match({
            players: req.body.players,
            teams: req.body.teams,
            startDatetime: startDatetime
        })
        match.save((err) => {
            if (err) { return next(boom.badImplementation(err)); }
            return res.json(match)
        })
    })
}