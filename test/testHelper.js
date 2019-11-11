/* eslint-disable no-console */
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DB_TEST_CONN_URL,
});

pool.on('connect', () => {
  console.log('connected to the db');
});

/**
 * Delete test user
 */
const deleteTestUser = () => {
  const queryText = `DELETE FROM users 
   WHERE jobRole = 'RegTester'`;
  pool.query(queryText)
    .then((res) => {
      // eslint-disable-next-line no-console
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
};

pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});

module.exports = {
  deleteTestUser,
};

require('make-runnable');
