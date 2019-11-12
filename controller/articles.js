// Import important modules
const db = require('../db/index');

module.exports = {
  async createArticle(req, res) {
    if (!req.body.title || !req.body.article) {
      return res.status(400).json({
        status: 'error',
        error: 'Your article must have a title and some content',
      });
    }
    const text = `INSERT INTO 
    articles(ownerId, title, article, tag)
    VALUES($1, $2, $3, $4) returning *`;
    const values = [req.user.id, req.body.title, req.body.article, req.body.tag];

    try {
      const { rows } = await db.query(text, values);
      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Article succesfully posted',
          ownerId: rows[0].ownerId,
          articleId: rows[0].id,
          createdOn: rows[0].created_date,
          title: rows[0].title,
          article: rows[0].article,
          category: rows[0].tag,
        },

      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        data: {
          message: 'Something weent wrong, Please try again',
        },

      });
    }
  },

};
