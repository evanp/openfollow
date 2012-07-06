var assert = require("assert");

describe('identifier', function() {

    var Identifier = require('../lib/Identifier');

    before(function(done) {
        var databank = require('databank'),
            DatabankObject = databank.DatabankObject,
            Databank = databank.Databank,
            db = Databank.get("memory", {});

        db.connect({}, function(err) {
            if (err) {
                done(err);
            } else {
                DatabankObject.bank = db;
                done();
            }
        });
    });

    it('should fail to find an unknown Identifier', function(done) {
        Identifier.get("unknown", function(err, person) {
            if (!err) {
                done(new Error("Shoulda failed"));
            } else {
                done();
            }
        });
    });

    it('should automatically add timestamps to a new identifier', function(done) {
        Identifier.create({id: "http://twitter.com/evanpro"}, function(err, identifier) {
            if (err) {
                done(err);
            } else {
                assert.ok(identifier);
                assert.ok(identifier.created);
                assert.ok(identifier.modified);
                done();
            }
        });
    });

    it('should have a canonical() class method', function(done) {
        assert.ok(Identifier.canonical);
        done();
    });

    it('should canonicalize uppercase hostnames in URLs to lowercase', function(done) {
        var can = Identifier.canonical("http://EXAMPLE.COM/evanpro");
        assert.equal(can, "http://example.com/evanpro");
        done();
    });

    it('should canonicalize default ports in HTTP URLs to null', function(done) {
        var can1 = Identifier.canonical("http://example.com:80/evanpro");
        var can2 = Identifier.canonical("https://example.com:443/evanpro");
        assert.equal(can1, "http://example.com/evanpro");
        assert.equal(can2, "https://example.com/evanpro");
        done();
    });

    it('should leave uppercase in paths of HTTP URLs alone', function(done) {
        var can = Identifier.canonical("http://EXAMPLE.COM/EVANPRO");
        assert.equal(can, "http://example.com/EVANPRO");
        done();
    });

    it('should change hashbang Twitter URLs to regular Twitter URLs', function(done) {
        var can = Identifier.canonical("https://twitter.com/#!/evanpro");
        assert.equal(can, "https://twitter.com/evanpro");
        done();
    });

    it('should change http Twitter URLs to https', function(done) {
        var can = Identifier.canonical("http://twitter.com/evanpro");
        assert.equal(can, "https://twitter.com/evanpro");
        done();
    });

    it('should change /-terminated Twitter URLs to no /', function(done) {
        var can = Identifier.canonical("https://twitter.com/evanpro/");
        assert.equal(can, "https://twitter.com/evanpro");
        done();
    });

    it('should change www.twitter.com URLs to no-www', function(done) {
        var can = Identifier.canonical("https://www.twitter.com/evanpro");
        assert.equal(can, "https://twitter.com/evanpro");
        done();
    });
});
