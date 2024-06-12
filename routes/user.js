const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user');
const router = express.Router();

router.post(
  '/register',
  [
    body('firstName').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
  ],
  userController.register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  userController.login
);

module.exports = router;
