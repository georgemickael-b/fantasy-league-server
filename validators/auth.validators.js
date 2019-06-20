const { check, validationResult, body } = require('express-validator/check');
const boom = require('boom')


const NO_OF_PLAYERS_PER_TEAM = 4

module.exports = function () {
    let signupValidator = [
        check('email', "Email is invalid").isEmail(),
        // password must be at least 5 chars long
        check('password', "Password must be minimum of 5 letters.").isLength({ min: 5 }),
        check('name', "Name must not be empty").not().isEmpty(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(boom.badData(JSON.stringify(errors.mapped())));
            }
            if (req.body.password !== req.body.confirmPassword)
                return next(boom.badData("Password doesnot match"));
            next()
        }
    ]

    let signinValidator = [
        check('email', "Email is invalid").isEmail(),
        // password must be at least 5 chars long
        check('password', "Password cannot be blank").not().isEmpty(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(boom.badData(JSON.stringify(errors.mapped())));
            }
            next()
        }
    ]
    return { signupValidator, signinValidator }
}
