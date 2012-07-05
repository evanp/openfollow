var Person = require('../lib/Person'),
    NoSuchThingError = require('databank').NoSuchThingError,
    async = require('async');

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

exports.search = function(req, res, next) {
    var ids = req.body.ids,
        getOthers = function(person, callback) {
            if (person) {
                person.getIdentifiers(callback);
            } else {
                callback(null, []);
            }
        },
        getPerson = function(id, callback) {
            Person.fromIdentifier(id, function(err, person) {
                if (err && err instanceof NoSuchThingError) {
                    callback(null, null);
                } else if (err) {
                    callback(err, null);
                } else {
                    callback(null, person);
                }
            });
        };

    async.map(ids, getPerson, function(err, people) {
        if (err) {
            next(err);
        } else {
            async.map(people, getOthers, function(err, identlist) {
                if (err) {
                    next(err);
                } else {
                    var i, results = {};
                    for (i = 0; i < ids.length; i++) {
                        results[ids[i]] = identlist[i];
                    }
                    res.json(results);
                }
            });
        }
    });
};


