const Router = require('express')
const path = require('path');
const fs = require('fs');
const router = new Router()
const userRouter = require('./UserRouter')
const applicationsRouter = require('./ApplicationsRouter')

router.use('/user', userRouter)
router.use('/applications', applicationsRouter)
router.get('/download/:filename', (req, res) => {
	try {
		const filename = req.params.filename;
		const filepath = path.join(__dirname, '../', 'static', filename);
		console.log(filepath);

		fs.access(filepath, fs.constants.F_OK, (err) => {
			if (err) {
				console.error(err);
				return res.status(404).send('File not found');
			}

			res.download(filepath);
		});
	} catch (error) {
		console.log(error)
	}

});

module.exports = router