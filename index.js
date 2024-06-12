require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./db')
const models = require('./models/models')
const router = require('./routes/index')
const ErrorHandler = require('./middleware/ErrorHandlingMiddleware')
const PORT = process.env.PORT

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)
app.use(ErrorHandler)

const start = async () => {
	try {
		await sequelize.authenticate()
		await sequelize.sync()
		app.listen(PORT, () => console.log(`Server listen on port = ${PORT}`))
	} catch (e) {
		console.log(e)
	}
}

start()