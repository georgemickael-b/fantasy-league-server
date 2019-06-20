const { check, validationResult, body } = require('express-validator/check');
const boom = require('boom')


const NO_OF_PLAYERS_PER_TEAM = 11

module.exports = function () {
    let createTeamValidator = [
        body('players').custom(players => {
            if (players.length < NO_OF_PLAYERS_PER_TEAM) {
                throw new Error(`${NO_OF_PLAYERS_PER_TEAM} players needed in a team`);
            }
            return true;
        }),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(boom.badData(JSON.stringify(errors.mapped())));
            }
            next()
        }
    ]
    return { createTeamValidator }
}
