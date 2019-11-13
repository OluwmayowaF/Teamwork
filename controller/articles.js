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

  async editArticle(req, res) {
    const findArticle = `SELECT * FROM 
    articles WHERE id = $1 AND ownerId = $2`;
    const updateArticle = `UPDATE articles
    SET title = $1, article = $2, tag=$3
    WHERE id = $4 AND ownerId = $5 returning *`;

    try {
      const { rows } = await db.query(findArticle, [req.params.articleId, req.user.id]);
      if (!rows[0]) {
        return res.status(404).json({
          status: 'error',
          error: 'Article with that id was not found for this user!',
        });
      }
      const values = [
        req.body.title || rows[0].title,
        req.body.article || rows[0].article,
        req.body.tag || rows[0].tag,
        req.params.articleId,
        req.user.id,
      ];
      const response = await db.query(updateArticle, values);
      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Article succesfully Updated',
          ownerId: response.rows[0].ownerId,
          articleId: response.rows[0].id,
          createdOn: response.rows[0].created_on,
          title: response.rows[0].title,
          article: response.rows[0].article,
          category: response.rows[0].tag,
        },
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  async deleteArticle(req, res) {
    const findArticle = `DELETE FROM 
    articles WHERE id = $1 AND ownerId = $2 returning *`;

    try {
      const { rows } = await db.query(findArticle, [req.params.articleId, req.user.id]);
      if (!rows[0]) {
        return res.status(404).json({
          status: 'error',
          error: 'Article with that id was not found for this user!',
        });
      }
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Article succesfully Deleted',
        },
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  async addComment(req, res) {
    if (!req.body.comment) {
      return res.status(400).json({
        status: 'error',
        error: 'Your comment must have some content',
      });
    }
    const findArticle = `SELECT * FROM 
    articles WHERE id = $1`;
    const addComment = `INSERT INTO
    articles_comments(articleId, ownerId, comment)
    values($1, $2, $3) returning *`;

    try {
      const { rows } = await db.query(findArticle, [req.params.articleId]);
      if (!rows[0]) {
        return res.status(404).json({
          status: 'error',
          error: 'Article was not found!',
        });
      }
      const values = [
        req.params.articleId,
        req.user.id,
        req.body.comment,
      ];

      const comment = await db.query(addComment, values);
      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Comment succesfully Added',
          createdOn: comment.rows[0].created_on,
          articleTitle: rows[0].title,
          article: rows[0].article,
          comment: comment.rows[0].comment,
        },
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  async getArticle(req, res) {
    // Return all Articles for a user with comments

    const findArticle = `SELECT 
    id, created_date, title, article
    FROM articles
    WHERE id = $1`;
    const findComment = `SELECT 
    id as commentId, comment, ownerId as authorId
    FROM
    articles_comments WHERE articleId= $1`;
    let comment = {};

    // try {
    const { rows } = await db.query(findArticle, [req.params.articleId]);
    if (!rows[0]) {
      return res.status(404).send({ status: 'error', message: 'That article does not exist' });
    }
    const comments = await db.query(findComment, [req.params.articleId]);
    if (!comments.rows[0]) {
      comment = 'No Comments have been added to this article';
    } else {
      comment = comments.rows;
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: rows[0].id,
        createdOn: rows[0].created_date,
        title: rows[0].title,
        article: rows[0].article,
        comments: comment,
      },
    });
  },

};
