const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profile');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

router.get('/:id', isAuth, profileController.getUser);
router.put('/:id', isAuth, [
  body('firstName').optional(),
  body('lastName').optional(),
  body('gender').optional().isIn(['Male', 'Female']),
  body('photo').optional()
], profileController.updateUser);
router.get('/', isAuth, profileController.getUsers);

module.exports = router;
