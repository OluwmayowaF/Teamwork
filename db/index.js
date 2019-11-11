const { Pool } = require('pg');
const dotenv = require('dotenv');

const environment = process.env.NODE_ENV;
const stage = require('../config')[environment];

dotenv.config();

const pool = new Pool({
  connectionString: stage.DBHost,
});

module.exports = {
  /**
     *  DB Query
     *  @param {object} req
     *  @param {object} res
     *  @returns {object} object
     */
  query(text, params) {
    return new Promise((resolve, reject) => {
      pool.query(text, params)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

};
