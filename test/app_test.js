var spawn = require('child_process').spawn
  , request = require('request');

describe('app', function() {
    var child;

    before(function(done) {
        child = spawn('node', ['app.js']);
        child.stdout.on('data', function(data) {
            setTimeout(done, 50);
        });
        child.stderr.pipe(process.stderr);
    });

    after(function(done) {
        child.on('exit', function() {
            done();
        });
        child.kill();
    });

    it('should have a home page', function(done) {
        request('http://localhost:3000/', function(err, resp, body) {
            resp.statusCode.should.equal(200);
            done();
        });
    });

    it('looks up an id', function(done) {
        request({url:'http://localhost:3000/',
                 json: {ids:['http://twitter.com/person']}},
                 function(err, resp, body) {
            resp.statusCode.should.equal(200);
            done();
        });
    });
});
