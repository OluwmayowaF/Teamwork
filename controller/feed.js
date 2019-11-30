const db = require('../db/index');

module.exports = {
  async getFeed(req, res) {
    const getArticles = `SELECT id, 
    created_date AS createdOn, title,
    article, ownerId AS authorId 
    FROM articles ORDER BY created_date ASC`;
    const getGifs = `SELECT id,
    created_date AS createdOn, title,
    imageUrl AS url, ownerId AS authorId FROM 
   gifs ORDER BY created_date  ASC`;

    const articles = await db.query(getArticles);
    const gifs = await db.query(getGifs);
    if (!articles.rows && !gifs.rows) {
      return res.status(404).json({
        status: 'error',
        error: 'No Feeds at this time',
      });
    }
    const feeds = articles.rows.concat(gifs.rows);
    feeds.sort((a, b) => new Date(a.createdon) - new Date(b.createdon));
    return res.status(200).json({
      status: 'success',
      data: feeds.reverse(),

    });
  },

  async getUserFeed(req, res) {
    const getArticles = `SELECT *
    FROM articles WHERE ownerid = $1
    ORDER BY created_date ASC`;
    const getGifs = `SELECT * FROM 
   gifs WHERE ownerid = $1
   ORDER BY created_date  ASC`;


    const articles = await db.query(getArticles, [req.user.id]);
    const gifs = await db.query(getGifs, [req.user.id]);
    if (!articles.rows && !gifs.rows) {
      return res.status(404).json({
        status: 'error',
        error: 'No Feeds at this time',
      });
    }
    const feeds = articles.rows.concat(gifs.rows);
    feeds.sort((a, b) => new Date(a.createdon) - new Date(b.createdon));
    return res.status(200).json({
      status: 'success',
      data: feeds.reverse(),

    });
  },

};
