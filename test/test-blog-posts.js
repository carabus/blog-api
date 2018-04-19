const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe("Blog Posts", function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it("should list items on GET", function() {
    return chai
      .request(app)
      .get("/blogPosts")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("array");

        expect(res.body.length).to.be.at.least(1);

        const expectedKeys = [
          "id",
          "title",
          "content",
          "author",
          "publishDate"
        ];
        res.body.forEach(function(item) {
          expect(item).to.be.a("object");
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  it("should add an item on POST", function() {
    const newItem = {
      title: "new blog entry",
      content: "new blog entry content",
      author: "me",
      publishDate: Date.now()
    };
    return chai
      .request(app)
      .post("/blogPosts")
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a("object");
        expect(res.body).to.include.keys(
          "id",
          "title",
          "content",
          "author",
          "publishDate"
        );
        expect(res.body.id).to.not.equal(null);
        // response should be deep equal to `newItem` from above if we assign
        // `id` to it from `res.body.id`
        expect(res.body).to.deep.equal(
          Object.assign(newItem, { id: res.body.id })
        );
      });
  });

  it("should update items on PUT", function() {
    const updateData = {
      title: "updated blog entry",
      content: "updated blog entry content",
      author: "updated me",
      publishDate: Date.now()
    };

    return (
      chai
        .request(app)
        // first have to get so we have an idea of object to update
        .get("/blogPosts")
        .then(function(res) {
          updateData.id = res.body[0].id;
          return chai
            .request(app)
            .put(`/blogPosts/${updateData.id}`)
            .send(updateData);
        })
        // prove that the PUT request has right status code
        // and returns updated item
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");
          expect(res.body).to.deep.equal(updateData);
        })
    );
  });

  it("should delete items on DELETE", function() {
    return (
      chai
        .request(app)
        // first have to get so we have an `id` of item
        // to delete
        .get("/blogPosts")
        .then(function(res) {
          return chai.request(app).delete(`/blogPosts/${res.body[0].id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        })
    );
  });
});
