
module.exports = {
  adminRoute: (req, res, next) => {
    if (req.role === 'admin') {
      next();
    } else {
      const result = {
        error: 'Unauthorized! This Route is reserved for Admin Users Only.',
        status: 401,
      };
      return res.status(401).send(result);
    }
  },

};
