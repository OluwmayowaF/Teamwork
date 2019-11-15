const controller = require('../controller/feed');

const middleware = require('../middleware/Auth');

const { validateToken } = middleware;

module.exports = (router) => {
  router.route('/feeds')
    .get(validateToken, controller.getFeed);
};
