
module.exports = {
  adminRoute: (req, res, next) => {
    if (req.role === 'admin') {
      next();
    } return res.status(401).json({
      error: 'Unauthorized! This Route is reserved for Admin Users Only.',
      status: 401,
    });
  },
};
