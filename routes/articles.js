const controller = require('../controller/articles');

const middleware = require('../middleware/Auth');

const authorization = require('../middleware/admin');

const { adminRoute } = authorization;

const { validateToken } = middleware;

module.exports = (router) => {
  router.route('/articles')
    .post(validateToken, controller.createArticle);

  router.route('/articles/:articleId')
    .patch(validateToken, controller.editArticle);

  router.route('/articles/:articleId')
    .delete(validateToken, controller.deleteArticle);

  router.route('/articles/:articleId/comment')
    .post(validateToken, controller.addComment);

  router.route('/articles/:articleId')
    .get(validateToken, controller.getArticle);

  router.route('/articles/category/:tag')
    .get(validateToken, controller.getArticlebyTag);

  router.route('/articles/:articleId/flag')
    .patch(validateToken, controller.flagArticle);

  router.route('/articles/:articleId/flag')
    .delete(validateToken, adminRoute, controller.deleteFlaged);
};
