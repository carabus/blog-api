const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require('faker');
const mongoose = require('mongoose');

const { BlogPosts } = require('../models');
const { TEST_DATABASE_URL } = require('../config');
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
  console.log('Seeding blog post data');
  let seedData = [];

  for(let i = 0; i<10; i++) {
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
  }
}

function tearDownDb() {
  console.warn('Deleting test database');
  mongoose.connection.dropDatabase();
}

describe("Blog Posts API", function() {
  before(function() {
    console.log(TEST_DATABASE_URL);
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogPostsData();
  })

  afterEach(function() {
    return tearDownDb();
  })

  after(function() {
    return closeServer();
  });

  it("should return all existing BlogPosts", function() {
    let res;
    return chai
      .request(app)
      .get("/blogPosts")
      .then(function(_res) {
        res = _res;
        expect(res).to.have.status(200);
        expect(res.body.results).to.have.length.of.at.least(1);
        return BlogPosts.count()
      })
      .then(function(count) {       
        expect(res.body.results.length).to.equal(count);
      });
  }); 
});