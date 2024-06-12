const { validationResult } = require('express-validator');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter
}).single('photo');

exports.getUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.updateUser = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      return res.status(422).json({ message: 'Invalid image format or size.' });
    }

    const userId = req.params.id;
    const { firstName, lastName, gender } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.gender = gender || user.gender;
      if (req.file) {
        if (user.photo) {
          fs.unlinkSync(path.join(__dirname, '..', 'uploads', user.photo));
        }
        user.photo = req.file.filename;
      }

      await user.save();
      res.status(200).json({ message: 'User updated!', user });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });
};

exports.getUsers = async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const users = await User.findAll({
      order: [['registrationDate', 'ASC']],
      limit,
      offset
    });

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
