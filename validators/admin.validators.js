const { check, validationResult, body } = require('express-validator/check');
const boom = require('boom')


const ADMIN_MIN_NO_PLAYERS_TO_CREATE_MATCH = 4

module.exports = function () {
    let chooseWinnerValidator = [
        check('pointsOfPlayers', "pointsOfPlayers field is missing").not().isEmpty(),
        check('match', "match field is missing").not().isEmpty(),
        (req, res, next) => {
            console.log(req.body)
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(boom.badData(JSON.stringify(errors.mapped())));
            }
            next()
        }
    ]
    let createMatchValidator = [
        body('players').custom(players => {
            if (players.length < ADMIN_MIN_NO_PLAYERS_TO_CREATE_MATCH) {
                throw new Error(`${ADMIN_MIN_NO_PLAYERS_TO_CREATE_MATCH} or more Players needed for a match`);
            }
            return true;
        }),
        (req, res, next) => {
            console.log(req.body)
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(boom.badData(JSON.stringify(errors.mapped())));
            }
            next()
        }
    ]
    return { createMatchValidator, chooseWinnerValidator }
}
