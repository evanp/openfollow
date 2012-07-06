var assert = require("assert"),
    async = require("async"),
    databank = require("databank"),
    DatabankObject = databank.DatabankObject,
    NoSuchThingError = databank.NoSuchThingError,
    Databank = databank.Databank;

describe("identifier", function() {

    var Identifier = require("../lib/Identifier"),
        Person = require("../lib/Person"),
        Edge = require("../lib/Edge");

    before(function(done) {
        var db = Databank.get("memory", {});

        db.connect({}, function(err) {
            if (err) {
                done(err);
            } else {
                DatabankObject.bank = db;
                done();
            }
        });
    });

    it("should have a method to make keys", function(done) {
        Edge.should.have.property("makeFromTo");
        Edge.makeFromTo.should.be.a("function");
        done();
    });

    it("should fail to find an unknown Edge", function(done) {
        var key = Edge.makeFromTo("http://example.com/unknown1", "http://example.com/unknown2");
        Edge.get(key, function(err, edge) {
            if (err && err instanceof NoSuchThingError) {
                done();
            } else if (err) {
                done(err);
            } else {
                done(new Error("Unexpected success"));
            }
        });
    });

    it("should succeed making a new Edge", function(done) {
        var props = {from: "http://example.com/unknown3",
                     to: "http://example.com/unknown4"};

        Edge.create(props, function(err, edge) {
            if (err) {
                done(err);
            } else {
                edge.should.be.a("object");
                edge.should.be.an.instanceOf(Edge);
                edge.should.have.property("from");
                edge.should.have.property("to");
                edge.should.have.property("fromto");
                edge.should.have.property("created");
                edge.should.have.property("modified");
                edge.from.should.equal("http://example.com/unknown3");
                edge.to.should.equal("http://example.com/unknown4");
                edge.fromto.should.be.a("string");
                edge.created.should.be.a("number");
                edge.modified.should.be.a("number");
                done();
            }
        });
    });

    it("should unify() identifiers when making complementary Edges", function(done) {
        var props1 = {from: "http://example.com/unknown5",
                      to: "http://example.com/unknown6"},
            props2 = {from: props1.to,
                      to: props1.from};

        async.waterfall([
            function(cb) {
                Edge.create(props1, cb);
            },
            function(edge1, cb) {
                Edge.create(props2, cb);
            },
            function(edge2, cb) {
                Person.fromIdentifier(props1.from, cb);
            },
            function(person, cb) {
                person.getIdentifiers(cb);
            },
            function(ids, cb) {
                ids.should.include(props1.from);
                ids.should.include(props1.to);
                cb(null);
            }
        ], done);
    });
});
