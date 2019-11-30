const Helper = require('../controller/helper');
const db = require('../db/index');

module.exports = {
  /**
   * Create a User
   * @param {object} req
   * @param {object} res
   *
   */
  async createUser(req, res) {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password
        || !req.body.department) {
      return res.status(400).json({
        status: 'error',
        error: 'The following fields are required before employee can be registered: firstname, lastname, email, password and department',
      });
    } if (!(Helper.validateEmail(req.body.email))) {
      return res.status(400).json({
        status: 'error',
        error: 'Please enter a valid email',
      });
    }
    const text = `INSERT INTO
              users( firstName, lastName, email, password, gender, jobRole, department, address, role)
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`;
    const hashPassword = Helper.hashPassword(req.body.password);
    const values = [req.body.firstName, req.body.lastName, req.body.email, hashPassword,
      req.body.gender, req.body.jobRole, req.body.department, req.body.address, req.body.role,
    ];

    try {
      const { rows } = await db.query(text, values);
      const beareToken = Helper.generateToken(rows[0].id);
      const user = rows[0];
      return res.status(201).json({
        status: 'success',
        data: {
          message: 'User account succesfully created',
          token: `Bearer ${beareToken}`,
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          department: user.department,
        },
      });
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return res.status(400).json({ status: 'error', error: 'User with that EMAIL already exist' });
      } return res.status(500).json({ status: 'error', error: 'Something went wrong, Please try again' });
    }
  },

  /**
   * Login
   * @param {object} req
   * @param {object} res
   *
   */

  async login(req, res) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: 'error',
        error: 'Kindly enter your email and password to login',
      });
    } if (!(Helper.validateEmail(req.body.email))) {
      return res.status(400).json({
        status: 'error',
        error: 'Please enter a valid email',
      });
    }
    const text = 'SELECT * FROM users WHERE email = $1';
    const email = [req.body.email];

    try {
      const { rows } = await db.query(text, email);
      if (!rows[0] || !Helper.comparePassword(rows[0].password, req.body.password)) {
        return res.status(404).json({
          status: 'error',
          error: 'Invalid Credentials',
        });
      }
      const bearerToken = Helper.generateToken(rows[0].id);

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Welcome! you have signed in succesfully',
          token: `Bearer ${bearerToken}`,
          userId: rows[0].id,
          firstname: rows[0].firstname,
          lastname: rows[0].lastname,
          email: rows[0].email,
          department: rows[0].department,
          role: rows[0].role,
        },
      });
    } catch (error) {
      return res.status(400).send(error);
    }
  },

  async getLoggedInUser(req, res) {
    const text = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await db.query(text, [req.user.id]);
    return res.status(200).json({
      status: 'success',
      data: {
        message: `Hi ${rows[0].firstname}!`,
        userId: rows[0].id,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        email: rows[0].email,
        department: rows[0].department,
        role: rows[0].role,
      },
    });
  },
  async getAUser(req, res) {
    const text = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await db.query(text, [req.params.userid]);
    return res.status(200).json({
      status: 'success',
      data: {
        userId: rows[0].id,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        email: rows[0].email,
        department: rows[0].department,
        role: rows[0].role,
      },
    });
  },


};
