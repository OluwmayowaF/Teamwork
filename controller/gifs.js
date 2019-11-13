// Import important modules
const Helper = require('../controller/helper');
// const cloudinary = require('cloudinary').v2;
const db = require('../db/index');


module.exports = {
  async createGif(req, res) {
    const gifImage = req.files.image;

    if (!gifImage || gifImage.mimetype !== 'image/gif') {
      return res.status(400).json({
        status: 'error',
        error: 'Kindly upload your gif to proceed',
      });
    } if (!req.body.title) {
      return res.status(400).json({
        status: 'error',
        error: 'Enter a title for your gif post',
      });
    }

    const image = await Helper.uploadToCloudinary(gifImage);

    const addUrl = `INSERT INTO 
          gifs(ownerId, title, imageUrl)
          values($1, $2, $3) returning *`;
    const values = [req.user.id, req.body.title, image.url];

    try {
      const { rows } = await db.query(addUrl, values);
      return res.status(201).json({
        status: 'success',
        data: {
          message: 'GIF image successfully posted',
          gifId: rows[0].id,
          createdOn: rows[0].created_on,
          title: rows[0].title,
          article: rows[0].imageUrl,
          gif: rows[0],
        },
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  },

};
