const path = require('path');
// Import important modules
const Helper = require('../controller/helper');
// const cloudinary = require('cloudinary').v2;
const db = require('../db/index');

module.exports = {
  async createGif(req, res) {
    if (!req.files || req.files.image.mimetype !== 'image/gif') {
      return res.status(400).json({ status: 'error', error: 'Kindly upload a gif to proceed' });
    }
    if (!req.body.title) {
      return res.status(400).json({ status: 'error', error: 'Enter a title for your gif post' });
    }
    const image = await Helper.uploadToCloudinary(req.files.image);

    const addUrl = 'INSERT INTO gifs(ownerId, title, imageUrl) values($1, $2, $3) returning *';
    const values = [req.user.id, req.body.title, image.url];
    try {
      const { rows } = await db.query(addUrl, values);
      return res.status(201).json({
        status: 'success',
        data: {
          gifId: rows[0].id,
          message: 'GIF image successfully posted',
          createdOn: rows[0].created_date,
          title: rows[0].title,
          imageUrl: rows[0].imageurl,
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

  async deleteGif(req, res) {
    const findgif = 'SELECT * FROM gifs WHERE id = $1 AND ownerId = $2 ';

    const deletegif = 'DELETE FROM gifs WHERE id = $1 AND ownerId = $2  returning *';
    const values = [req.params.gifId, req.user.id];
    try {
      const { rows } = await db.query(findgif, values);
      if (!rows[0]) {
        return res.status(404).json({ status: 'error', error: 'Gif was not found!!' });
      }
      const url = rows[0].imageurl;
      const publicId = path.basename(url, '.gif');
      await Helper.deleteInCloudinary(publicId);
      await db.query(deletegif, values);

      return res.status(200).json({
        status: 'success',
        data: { message: 'Gif succesfully Deleted' },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        error: 'Something went wrong, Please try again',
      });
    }
  },
  async addComment(req, res) {
    if (!req.body.comment) {
      return res.status(400).json({ status: 'error', error: 'Your comment must have some content' });
    }
    // Fetch Gif
    const findgif = 'SELECT * FROM gifs WHERE id = $1';
    const addComment = 'INSERT INTO gifs_comments(ownerId, gifId, comment) values($1, $2, $3) returning *';
    const values = [req.user.id, req.params.gifId, req.body.comment];

    try {
      const gif = await db.query(findgif, [req.params.gifId]);
      if (!gif.rows[0]) {
        return res.status(404).json({ status: 'error', error: 'Gif was not found!' });
      }
      const comment = await db.query(addComment, values);
      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Comment succesfully Added',
          createdOn: comment.rows[0].created_date,
          giftitle: gif.rows[0].title,
          Gif: gif.rows[0].imageUrl,
          comment: comment.rows[0].comment,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Something weent wrong, Please try again',
      });
    }
  },

  async getGif(req, res) {
    const getAuthor = 'SELECT * FROM users WHERE id = $1';
    let comment = {};
    const findGif = 'SELECT * FROM gifs WHERE id = $1';
    const findComment = `SELECT firstname, lastname, comment, ownerId as authorId, A.created_date as comment_date
    FROM users U  RIGHT JOIN gifs_comments A 
    ON A.ownerid = U.id
    WHERE A.gifId = $1`;
    try {
      const { rows } = await db.query(findGif, [req.params.gifId]);
      if (!rows[0]) {
        return res.status(404).send({ status: 'error', error: 'Gif was not found!' });
      }
      const comments = await db.query(findComment, [req.params.gifId]);
      if (!comments.rows[0]) {
        comment = 'No Comments have been added to this gif';
      } else { comment = comments.rows; }
      const user = await db.query(getAuthor, [rows[0].ownerid]);
      return res.status(200).json({
        status: 'success',
        data: {
          id: rows[0].id,
          createdOn: rows[0].created_date,
          title: rows[0].title,
          url: rows[0].imageurl,
          ownerid: rows[0].ownerid,
          ownername: `${user.rows[0].firstname} ${user.rows[0].lastname}`,
          comments: comment,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Something weent wrong, Please try again',
      });
    }
  },

  async flagGif(req, res) {
    const findgif = 'SELECT * FROM gifs WHERE id = $1';
    try {
      const gif = await db.query(findgif, [req.params.gifId]);
      if (!gif.rows[0]) {
        return res.status(404).json({ status: 'error', error: 'Gif was not found!!' });
      }
      const flaggif = `UPDATE gifs SET flags = flags + 1
      WHERE id = $1 returning *`;

      const flag = await db.query(flaggif, [req.params.gifId]);
      return res.status(200).json({
        status: 'success',
        error: 'Flaged as inappropraite',
        data: flag.rows,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        data: { message: 'Something went wrong, Please try again' },
      });
    }
  },

  async deleteFlaged(req, res) {
    const findgif = 'SELECT * FROM gifs WHERE id = $1 AND flags > 0';
    const deletegif = 'DELETE FROM gifs WHERE id = $1';

    try {
      const { rows } = await db.query(findgif, [req.params.gifId]);
      if (!rows[0]) {
        return res.status(404).json({
          status: 'error',
          error: 'Flagged Gif was not found',
        });
      } await db.query(deletegif, [req.params.gifId]);
      return res.status(200).json({
        status: 'success',
        message: 'Gif deleted succesfully',
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', error: 'Something weent wrong, Please try again' });
    }
  },


};
