const controller = require('../controller/gifs');

const middleware = require('../middleware/Auth');

const { validateToken } = middleware;

module.exports = (router) => {
  router.route('/gifs')
    .post(validateToken, controller.createGif);
};
