var assert = require("assert");

describe('person', function() {

  var Person = require('../lib/Person'),
      Identifier = require('../lib/Identifier');

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
      Person.get("unknown", function(err, person) {
          if (!err) {
              done(new Error("Shoulda failed"));
          } else {
              done();
          }
      });
  });

  it('should automatically add a uuid to a new person', function(done) {
      Person.create({}, function(err, person) {
          if (err) {
              done(err);
          } else {
              assert.ok(person);
              assert.ok(person.uuid);
              done();
          }
      });
  });
});
