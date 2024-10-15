const express = require('express');
const router = express.Router();
const validateSchema = require('../validator');
const { signUpSchema, signInSchema } = require('../authSchema');
const { authRequired, isAdmin } = require('../auth');

const userController = require('../controllers/userController');

router.post('/sign-up', validateSchema(signUpSchema), userController.signUP);
router.post('/sign-in', validateSchema(signInSchema), userController.signIN);
router.post('/sign-out', userController.signOUT);
router.get('/account', authRequired, userController.account);
router.get('/verify', userController.verifyToken);

router.get('/all-users', authRequired, isAdmin, userController.getUsers);
router.put('/block-users', authRequired, isAdmin, userController.blockUsers);
router.put(
  '/unblock-users',
  authRequired,
  isAdmin,
  userController.unblockUsers
);
router.delete(
  '/delete-users',
  authRequired,
  isAdmin,
  userController.deleteUsers
);

router.put('/add-admins', authRequired, isAdmin, userController.addAdmin);
router.put('/remove-admins', authRequired, isAdmin, userController.removeAdmin);

module.exports = router;
