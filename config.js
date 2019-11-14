module.exports = {
  development: {
    port: process.env.PORT || 3000,
    DBHost: process.env.DB_LOCAL_CONN_URL,
  },
  test: {
    port: process.env.PORT || 8001,
    DBHost: process.env.DB_TEST_CONN_URL,
  },
  port: {
    port: process.env.PORT || 3000,
    DBHost: process.env.DB_LOCAL_CONN_URL,
  },

};
