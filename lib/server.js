/**
 * Module dependencies.
 */

var express = require('express')
  , databank = require('databank')
  , routes = require('../routes')
  , http = require('http')
  , Databank = databank.Databank
  , DatabankObject = databank.DatabankObject;

var newServer = function(config) {

    var app = express.createServer(),
        port = config.port || process.env.PORT || 3000;

    app.configure(function(){
        app.set('port', port);
        app.set('views', __dirname + '../views');
        app.set('view engine', 'jade');
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(__dirname + '../public'));
    });

    app.configure('development', function(){
        app.use(express.errorHandler());
    });

    app.get('/', routes.index);
    app.post('/v0.1/ids', routes.search);

    var driver = config.driver || "memory";
    var params = config.params || {};

    var db = Databank.get(driver, params);

    app.run = function(callback) {
        var self = this,
            removeListeners = function() {
                self.removeListener("listening", listenSuccessHandler);
                self.removeListener("error", listenErrorHandler);
            },
            listenErrorHandler = function(err) {
                removeListeners();
                callback(err);
            },
            listenSuccessHandler = function() {
                removeListeners();
                self.port = port;
                callback(null);
            };

        db.connect(params, function(err) {
            if (err) {
                callback(err);
            } else {
                // Global database
                DatabankObject.bank = db;
                self.on("error", listenErrorHandler);
                self.listen(port, listenSuccessHandler);
            }
        });
    };

    return app;
};

exports.newServer = newServer;
