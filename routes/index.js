var person_db = require('../lib/Person'),
    Person = person_db.Person,
    async = require('async');

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

exports.search = function(req, res) {
    var ids = req.body.ids,
        getOthers = function(person, callback) {
            person.getIdentifiers(callback);
        };

    async.map(ids, Person.fromIdentifier, function(err, people) {
        async.map(people, getOthers, function(err, identlist) {
            var i, results = {};
            for (i = 0; i < ids.length; i++) {
                results[ids[i]] = identlist[i];
            }
            res.json(results);
        });
    });
};


