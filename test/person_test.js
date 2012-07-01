describe('person', function() {

  var Person = require('../lib/Person').Person;

  before(function(done) {
      var databank = require('databank'),
          DatabankObject = databank.DatabankObject,
          Databank = databank.Databank,
          db = Databank.get("memory", {});

      db.connect({}, function(err) {
          if (err) {
              done(err);
          } else {
              DatabankObject.bank = db;
              done();
          }
      });
  });

  it('should fail to find an unknown person', function(done) {
      Person.get("unknown", done);
  });
});
