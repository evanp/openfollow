var assert = require("assert"),
    async = require("async");

describe('identifier', function() {

    var Identifier = require('../lib/Identifier'),
        Person = require('../lib/Person'),
        people = new Array(10);

    before(function(done) {
        var databank = require('databank'),
            DatabankObject = databank.DatabankObject,
            Databank = databank.Databank,
            db = Databank.get("memory", {}),
            personMaker = function(i) {
                return function(cb) {
                    async.waterfall([
                        function(cb) {
                            Person.create({}, cb);
                        },
                        function(person, cb) {
                            people[i] = person;
                            Identifier.create({id: "http://example.com/bound" + i, person: person.uuid}, cb);
                        },
                        function(id, cb) {
                            Identifier.create({id: "http://example.com/equivalent" + i, person: people[i].uuid}, cb);
                        },
                        function(id, cb) {
                            cb(null);
                        }
                    ], cb);
                };
            };

        db.connect({}, function(err) {
            if (err) {
                done(err);
            } else {
                DatabankObject.bank = db;
                // Blech
                async.parallel([
                    personMaker(0),
                    personMaker(1),
                    personMaker(2),
                    personMaker(3),
                    personMaker(4),
                    personMaker(5),
                    personMaker(6),
                    personMaker(7),
                    personMaker(8),
                    personMaker(9)
                ], done);
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

    it('should have a unify() method', function(done) {
        assert.ok(Identifier.unify);
        done();
    });

    it('should unify two new identifiers with a new person', function(done) {
        Identifier.unify("http://example.com/unbound0", "http://example.com/unbound1", function(err, uuid) {
            assert.ifError(err);
            assert.ok(uuid);
            done();
        });
    });

    it('should unify unbound second item with bound first item', function(done) {
        Identifier.unify("http://example.com/bound0", "http://example.com/unbound2", function(err, uuid) {
            assert.ifError(err);
            assert.ok(uuid);
            assert.equal(uuid, people[0].uuid);
            done();
        });
    });

    it('should unify unbound first item with bound second item', function(done) {
        Identifier.unify("http://example.com/unbound3", "http://example.com/bound1", function(err, uuid) {
            assert.ifError(err);
            assert.ok(uuid);
            assert.equal(uuid, people[1].uuid);
            done();
        });
    });

    it('should unify bound first item with equivalent bound second item', function(done) {
        Identifier.unify("http://example.com/bound2", "http://example.com/equivalent2", function(err, uuid) {
            assert.ifError(err);
            assert.ok(uuid);
            assert.equal(uuid, people[2].uuid);
            done();
        });
    });

    it('should error unifying two non-equivalent bound items', function(done) {
        Identifier.unify("http://example.com/bound3", "http://example.com/bound4", function(err, uuid) {
            assert.ok(err);
            done();
        });
    });

    it('should unify a second unbound item after first unbound item is bound', function(done) {
        Identifier.unify("http://example.com/bound5", "http://example.com/unbound4", function(err, uuid) {
            assert.ifError(err);
            Identifier.unify("http://example.com/unbound4", "http://example.com/unbound5", function(err, uuid) {
                assert.ifError(err);
                assert.ok(uuid);
                assert.equal(uuid, people[5].uuid);
                done();
            });
        });
    });
});
