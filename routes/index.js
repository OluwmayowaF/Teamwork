const users = require('./users');
const articles = require('./articles');
const gifs = require('./gifs');
const feed = require('./feed');

module.exports = (router) => {
  users(router);
  articles(router);
  gifs(router);
  feed(router);
  return router;
};
