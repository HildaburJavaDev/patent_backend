const APIError = require('../errors/APIErrors')

module.exports = function (err, req, res, next) {
	if (err instanceof APIError) return res.status(err.status).json({ message: err.message })
}