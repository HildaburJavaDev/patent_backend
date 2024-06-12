const Router = require('express')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')
const userController = require('../controllers/UserController')

router.get('/auth', authMiddleware, userController.check)
router.post('/setdata', authMiddleware, userController.setUserData)
router.patch('/setdata', authMiddleware, userController.updateUserData)
router.patch('/updatepassword', authMiddleware, userController.updateUserPassword)
router.post('/updatepersonal', authMiddleware, userController.updateUserData)
router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/:userId', userController.getProfile)
router.patch('/assignModerator', authMiddleware, userController.assignModerator)


module.exports = router