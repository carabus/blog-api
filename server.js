const express = require("express");
const morgan = require("morgan");

const app = express();

const blogPostsRouter = require("./blogPostsRouter");

// log the http layer
app.use(morgan("common"));

// when requests come into `/blogs`
// we'll route them to the express
// router instance we've imported.
app.use("/blogPosts", blogPostsRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
