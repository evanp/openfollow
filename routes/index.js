var person_db = require('../lib/Person');

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' })
};

exports.search = function(req, res) {
    req.body.ids.forEach(function(id) {
        console.log("searching on "+id);
        var person = person_db.Person.fromIdentifier(id);
    })
    res.json(req.body)
}
