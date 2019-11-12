const jwt = require('jsonwebtoken');
const db = require('../db/index');


module.exports = {
  async validateToken(req, res, next) {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];// Bearer <token>
      const options = {
        expiresIn: '7d',
        issuer: 'http://localhost3000',
      };
      try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET, options);
        const text = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await db.query(text, [decoded.userId]);
        if (!rows[0]) {
          return res.status(404).json({ status: 'error', error: 'Invalid Token' });
        }
        // Decoded token to be passed back to the request object
        const User = rows[0];
        req.user = { id: User.id };
        req.role = User.role;
        next();
      } catch (err) {
        return res.status(401).json({ status: 'error', error: 'Invalid Token' });
      }
    } else {
      return res.status(401).json({
        error: 'Authorization Token not found',
        status: 401,
      });
    }
  },
};
