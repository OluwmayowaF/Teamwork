const users = require('./users');
const articles = require('./articles');
const gifs = require('./gifs');

module.exports = (router) => {
  users(router);
  articles(router);
  gifs(router);
  return router;
};
