const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { BlogPosts } = require("./models");

router.get("/", (req, res) => {
  BlogPosts.find()
    .limit(10)
    .then(results => {
      res.json({
        results: results.map(blogPost => blogPost.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

module.exports = router;
