class APIErrors extends Error {
	constructor(status, message) {
		super();
		this.status = status;
		this.message = message;
	}

	static badRequest(message) {
		return new APIErrors(400, message)
	}

	static internalQuery(message) {
		return new APIErrors(500, message)
	}

	static forbiddenRequest(message) {
		return new APIErrors(403, message)
	}
}

module.exports = APIErrors