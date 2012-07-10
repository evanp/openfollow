var assert = require("assert"),
    async = require("async");

describe("relme", function() {

    var RelMe;

    before(function(done) {
        RelMe = require("../lib/relme");
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
});
