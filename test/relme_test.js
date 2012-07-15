var assert = require("assert"),
    express = require("express"),
    should = require("should"),
    async = require("async");

describe("relme", function() {

    var app, RelMe;

    before(function(done) {

        // Initialize the module.

        RelMe = require("../lib/relme");

        // Initialize the app.

        app = express.createServer();

        app.get("/image.png", function(req, res, next) {
            res.sendfile(__dirname + "/image.png");
        });

        app.get("/user1.html", function(req, res, next) {
            res.send("<html><head><title>User 1</title></head>"+
                     "<body><p>No rel-me links here.</p></body></html>", 200);
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
                     "<li></ul></body></html>", 200);
        });

        app.listen(4816, "localhost", function() {
            done();
        });
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

    it("should have a custom error class for type mismatches", function(done) {
        RelMe.should.have.property("TypeError");
        RelMe.TypeError.should.be.a("function");
        done();
    });

    it("should have a custom error class for HTTP failures", function(done) {
        RelMe.should.have.property("HTTPError");
        RelMe.HTTPError.should.be.a("function");
        done();
    });

    it("should have a custom error class for HTTP failures", function(done) {
        RelMe.should.have.property("ProtocolError");
        RelMe.ProtocolError.should.be.a("function");
        done();
    });

    it("should give an error when asking for a non-HTTP resource", function(done) {
        RelMe.getLinks("ftp://localhost/some/path", function(err, links) {
            should.exist(err);
            err.should.be.a("object");
            err.should.be.an.instanceOf(RelMe.ProtocolError);
            err.should.have.property("protocol");
            err.protocol.should.equal("ftp:");
            done();
        });
    });

    it("should give an error when asking for a missing resource", function(done) {
        RelMe.getLinks("http://localhost:4816/missing", function(err, links) {
            console.log(err);
            console.log(links);
            should.exist(err);
            err.should.be.a("object");
            err.should.be.an.instanceOf(RelMe.HTTPError);
            err.should.have.property("code");
            err.code.should.equal(404);
            done();
        });
    });

    it("should give an error when asking for a non-HTML resource", function(done) {
        RelMe.getLinks("http://localhost:4816/image.png", function(err, links) {
            should.exist(err);
            err.should.be.a("object");
            err.should.be.an.instanceOf(RelMe.TypeError);
            err.should.have.property("type");
            done();
        });
    });

    it("should return an empty list for a page without links", function(done) {
        RelMe.getLinks("http://localhost:4816/user1.html", function(err, links) {
            should.not.exist(err);
            should.exist(links);
            links.should.be.a("object");
            links.should.be.an.instanceOf(Array);
            links.should.have.length(0);
            done();
        });
    });

    it("should return the right links for a page with relme links", function(done) {
        RelMe.getLinks("http://localhost:4816/user2.html", function(err, links) {
            should.not.exist(err);
            should.exist(links);
            links.should.be.a("object");
            links.should.be.an.instanceOf(Array);
            links.should.have.length(3);
            links.should.include("http://geo.example.com/user2");
            links.should.include("http://user2.example.net/blog");
            links.should.include("http://video.example.com/user2");
            done();
        });
    });
});
