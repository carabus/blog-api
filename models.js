"use strict";

const mongoose = require("mongoose");

let blogPostsSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      firstName: String,
      lastName: String
    }
  },
  { timestamps: { createdAt: "created" } }
);

blogPostsSchema.set("collection", "blogPosts");
//virtual for author
blogPostsSchema.virtual("authorComplete").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostsSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorComplete,
    created: this.created
  };
};

const BlogPosts = mongoose.model("blogPost", blogPostsSchema, "blogPosts");

module.exports = { BlogPosts };
