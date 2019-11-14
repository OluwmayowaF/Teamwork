const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;

const environment = process.env.NODE_ENV;
const stage = require('../config')[environment];

const Helper = {
  /**
   * Gnerate Token
   * @param {string} id
   * @returns {string} token
   */
  generateToken(id) {
    const options = {
      expiresIn: '100d',
      issuer: 'http://localhost3000',
    };
    const secret = process.env.JWT_SECRET;
    const payload = { userId: id };
    const token = jwt.sign(payload, secret, options);

    return token;
  },

  /**
   * Hash Password Method
   * @param {string} password
   * @returns {string} returns hashed password
   */
  hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(stage.saltingRounds));
  },

  /**
   * comparePassword
   * @param {string} hashPassword
   * @param {string} password
   * @returns {Boolean} return True or False
   */
  comparePassword(hashPassword, password) {
    return bcrypt.compareSync(password, hashPassword);
  },

  /**
   * validateEmail
   * @param {string} email
   * @returns {Boolean} return True or False
   */

  validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  },

  uploadToCloudinary(image) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(image.tempFilePath, { folder: 'TeamworkDemo' }, (err, url) => {
        if (err) return reject(err);
        return resolve(url);
      });
    });
  },
  deleteInCloudinary(image) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(`TeamworkDemo/${image}`, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  },
};

module.exports = Helper;
