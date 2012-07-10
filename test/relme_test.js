var assert = require("assert"),
    express = require("express"),
    should = require("should"),
    async = require("async");

describe("relme", function() {

    var RelMe = require("../lib/relme"),
        app;

    before(function(done) {
        app = express.createServer();
        app.get("/missing", function(req, res, next) {
            res.send("Not here", 404);
        });
        app.get("/image.png", function(req, res, next) {
            res.sendfile(__dirname + "/image.png");
        });
        app.get("/user1.html", function(req, res, next) {
            res.send("<html><head><title>User 1</title></head>"+
                     "<body><p>No rel-me links here.</p></body></html>");
        });
        app.get("/user2.html", function(req, res, next) {
            res.send("<html><head><title>User 2</title></head>"+
                     "<body><ul>"+
                     "<li><a href='http://photo.example.com/user2'>Photo User 2</a></li>"+
                     "<li><a href='http://geo.example.com/user2' rel='me'>Geo User 2</a></li>"+
                     "<li><a href='http://user2.example.net/blog' rel='me'>User 2 blog</a></li>"+
                     "<li><a rel='me'>No HREF</a></li>"+
                     "<li><a href='http://geo.example.com/user2' rel='me'>Dupe</a></li>"+
                     "<li><a href='http://video.example.com/user2' rel='me video'>Video User 2</a></li>"+
                     "<li></ul></body></html>");
        });
        app.listen(4816);
        done();
    });

    it("should be a singleton object", function(done) {
        RelMe.should.be.a("object");
        done();
    });

    it("should have a method to get links", function(done) {
        RelMe.should.have.property("getLinks");
        RelMe.getLinks.should.be.a("function");
        done();
    });

    it("should give an error when asking for a missing resource", function(done) {
        RelMe.getLinks("http://localhost:4816/missing", function(err, links) {
            should.exist(err);
            err.should.be.a("object");
            err.should.be.an.instanceOf(Error);
            done();
        });
    });

    it("should give an error when asking for a non-HTML resource", function(done) {
        RelMe.getLinks("http://localhost:4816/image.png", function(err, links) {
            should.exist(err);
            err.should.be.a("object");
            err.should.be.an.instanceOf(Error);
            done();
        });
    });

    it("should return an empty list for a page without links", function(done) {
        RelMe.getLinks("http://localhost:4816/user1.html", function(err, links) {
            should.not.exist(err);
            should.exist(links);
            links.should.be.a("array");
            links.should.have.length(0);
            done();
        });
    });
});
