const controller = require('../controller/gifs');

const middleware = require('../middleware/Auth');

const { validateToken } = middleware;

module.exports = (router) => {
  router.route('/gifs')
    .post(validateToken, controller.createGif);
  router.route('/gifs/:gifId')
    .delete(validateToken, controller.deleteGif);
  router.route('/gifs/:gifId/comment')
    .post(validateToken, controller.addComment);
  router.route('/gifs/:gifId')
    .get(validateToken, controller.getGif);
  router.route('/gifs/:gifId/flag')
    .patch(validateToken, controller.flagGif);
};
