const controller = require('../controller/users');

const middleware = require('../middleware/Auth');

const authorization = require('../middleware/admin');

const { adminRoute } = authorization;

const { validateToken } = middleware;

module.exports = (router) => {
  router.route('/auth/create-user')
    .post(validateToken, adminRoute, controller.createUser);
  router.route('/auth/signin')
    .post(controller.login);
  router.route('/auth/user')
    .get(validateToken, controller.getLoggedInUser);
  router.route('/auth/user/:userid')
    .get(validateToken, controller.getAUser);
  router.route('/auth/users')
    .get(validateToken, adminRoute, controller.getAllUser);
};
