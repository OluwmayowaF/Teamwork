const controller = require('../controller/articles');

const middleware = require('../middleware/Auth');

const { validateToken } = middleware;

module.exports = (router) => {
  router.route('/articles')
    .post(validateToken, controller.createArticle);
  router.route('/articles/:articleId')
    .patch(validateToken, controller.editArticle);
};
