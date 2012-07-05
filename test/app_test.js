var spawn = require('child_process').spawn
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

        app.run(done);
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

    it('looks up an id', function(done) {
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

    it('looks up multiple IDs', function(done) {
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
});
