var spawn = require('child_process').spawn
  , async = require('async')
  , Person = require('../lib/Person')
  , Identifier = require('../lib/Identifier')
  , server = require('../lib/server')
  , request = require('request');

describe('app', function() {
    var app;

    before(function(done) {

        var config = {
            port: 2342,
            driver: "memory",
            params: {}
        };

        app = server.newServer(config);

        app.run(function(err) {
            if (err) throw err;
            async.waterfall([
                function(cb) {
                    Person.create({}, cb);
                },
                function(person, cb) {
                    async.parallel([
                        function(cb) {
                            Identifier.create({id: "http://twitter.com/evanpro",
                                               person: person.uuid},
                                              cb);
                        },
                        function(cb) {
                            Identifier.create({id: "http://identi.ca/evan",
                                               person: person.uuid},
                                              cb);
                        }
                    ], cb);
                }
            ], done);
        });
    });

    after(function(done) {
        done();
    });

    it('should have a home page', function(done) {
        request('http://localhost:2342/', function(err, resp, body) {
            resp.statusCode.should.equal(200);
            done();
        });
    });

    it('looks up a missing ID', function(done) {
        request({url:'http://localhost:2342/v0.1/ids',
                 method: 'POST',
                 json: {ids:['http://twitter.com/person']}},
                 function(err, resp, body) {
            resp.statusCode.should.equal(200);
            body.should.have.property('http://twitter.com/person');
            body['http://twitter.com/person'].should.be.empty;
            done();
        });
    });

    it('looks up multiple multiple missing IDs', function(done) {
        request({url:'http://localhost:2342/v0.1/ids',
                 method: 'POST',
                 json: {ids:['http://twitter.com/person1', 'http://twitter.com/person2']}},
                 function(err, resp, body) {
            resp.statusCode.should.equal(200);
            body.should.have.property('http://twitter.com/person1');
            body.should.have.property('http://twitter.com/person2');
            body['http://twitter.com/person1'].should.be.empty;
            body['http://twitter.com/person2'].should.be.empty;
            done();
        });
    });

    it('looks up a known ID', function(done) {
        request({url:'http://localhost:2342/v0.1/ids',
                 method: 'POST',
                 json: {ids:['http://twitter.com/evanpro']}},
                 function(err, resp, body) {
            resp.statusCode.should.equal(200);
            body.should.have.property('http://twitter.com/evanpro');
            body['http://twitter.com/evanpro'].should.be.an.instanceOf(Array);
            body['http://twitter.com/evanpro'].should.include('http://identi.ca/evan');
            body['http://twitter.com/evanpro'].should.include('https://twitter.com/evanpro');
            done();
        });
    });

});
