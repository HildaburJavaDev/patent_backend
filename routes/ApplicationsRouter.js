const Router = require('express')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')
const PatentController = require('../controllers/PatentController')

router.post('/create', authMiddleware, PatentController.create)
router.get('/', authMiddleware, PatentController.getAll)
router.get('/:bidid', authMiddleware, PatentController.getOne)
router.patch('/:bidid/changestatus', authMiddleware, PatentController.changeStatus)

module.exports = router