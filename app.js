
/**
 * Module dependencies.
 */

var express = require('express')
  , databank = require('databank')
  , routes = require('./routes')
  , config = require('./config')
  , http = require('http')
  , Databank = databank.Databank
  , DatabankObject = databank.DatabankObject;

var app = module.exports = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/v0.1/ids', routes.search);

var driver = config.driver || "memory";
var params = config.params || {};

var db = Databank.get(driver, params);

db.connect(params, function(err) {
    if (err) {
        console.error("Can't connect to database: " + err.message);
    } else {
        // Global database
        DatabankObject.bank = db;
        http.createServer(app).listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
        });
    }
});
