const controller = require('../controller/articles');

const middleware = require('../middleware/Auth');

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
};
