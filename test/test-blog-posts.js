const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");

const { BlogPosts } = require("../models");
const { TEST_DATABASE_URL } = require("../config");
const { app, runServer, closeServer } = require("../server");

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

function seedBlogPostsData() {
  console.log("Seeding blog post data");
  let seedData = [];

  for (let i = 0; i < 10; i++) {
    seedData.push(generateBlogPostData());
  }
  return BlogPosts.insertMany(seedData);
}

function generateBlogPostData() {
  return {
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    }
  };
}

function tearDownDb() {
  console.warn("Deleting test database");
  mongoose.connection.dropDatabase();
}

describe("Blog Posts API", function() {
  before(function() {
    console.log(TEST_DATABASE_URL);
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogPostsData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe("GET endpoint", function() {
    it("should return all existing BlogPosts", function() {
      let res;
      return chai
        .request(app)
        .get("/blogPosts")
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.results).to.have.length.of.at.least(1);
          return BlogPosts.count();
        })
        .then(function(count) {
          expect(res.body.results.length).to.equal(count);
        });
    });

    it("should return blog post with right fields", function() {
      // Strategy: Get back all blog posts, and ensure they have expected keys

      let resBlogPost;
      return chai
        .request(app)
        .get("/blogPosts")
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.results).to.be.a("array");
          expect(res.body.results).to.have.length.of.at.least(1);

          res.body.results.forEach(function(blogPost) {
            expect(blogPost).to.be.a("object");
            expect(blogPost).to.include.keys(
              "id",
              "title",
              "content",
              "author",
              "created",
            );
          });
          resBlogPost = res.body.results[0];
          return BlogPosts.findById(resBlogPost.id);
        })
        .then(function(blogPost) {
          expect(resBlogPost.id).to.equal(blogPost.id);
          expect(resBlogPost.title).to.equal(blogPost.title);
          expect(resBlogPost.content).to.equal(blogPost.content);
          expect(resBlogPost.author).to.equal(`${blogPost.author.firstName} ${blogPost.author.lastName}`);
          // todo dates issue
          // expect(resBlogPost.created).to.equal(blogPost.created);
        });
    });
  });

  describe('PUT endpoint', function() {

    it('should update fields you send over', function() {
      const updateData = {
        title: 'fofofofofofofof',
        content: 'futuristic fusion'
      };

      return BlogPosts
        .findOne()
        .then(function(blogPost) {
          updateData.id = blogPost.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/blogPosts/${blogPost.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return BlogPosts.findById(updateData.id);
        })
        .then(function(blogPost) {
          expect(blogPost.title).to.equal(updateData.title);
          expect(blogPost.content).to.equal(updateData.content);
        });
    });
  });

  describe('DELETE endpoint', function() {
    it('delete a blog post by id', function() {

      let blogPost;

      return BlogPosts
        .findOne()
        .then(function(_blogPost) {
          blogPost = _blogPost;
          return chai.request(app).delete(`/blogPosts/${blogPost.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return BlogPosts.findById(blogPost.id);
        })
        .then(function(_blogPost) {
          expect(_blogPost).to.be.null;
        });
    });
  });

});
