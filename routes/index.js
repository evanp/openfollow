var person_db = require('../lib/Person');

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' })
};

exports.search = function(req, res) {
  answer = {}

  req.body.ids.forEach(function(id) {
    console.log("searching on "+id);
    person_db.Person.fromIdentifier(id, function(err,data){callback(id,err,data)});
  })

  function callback(id, err, data) {
    answer[id] = [];
    if(err) {
      answer.status = "ERR"
    } else {
      answer.status = "OK"
    }
    // if req.body.ids.length == the_end, then answer
    //res.json(answer)
  }

}

