const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
require('dotenv').config();

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { firstName, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      firstName,
      email,
      password: hashedPassword,
      registrationDate: new Date()
    });

    res.status(201).json({ message: 'User registered!', userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    console.log({ email, password })
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return res.status(401).json({ message: 'Wrong password.' });
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user.id.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, userId: user.id.toString() });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
