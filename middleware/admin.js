
module.exports = {
  adminRoute: (req, res, next) => {
    if (req.role === 'admin') {
      next();
    } else {
      const result = {
        error: 'Permission Denied! This Route is reserved for Admin Users Only.',
        status: 'error',
      };
      return res.status(403).send(result);
    }
  },

};
