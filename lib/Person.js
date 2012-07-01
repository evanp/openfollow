// Person class

var databank = require("databank"),
    Identifier = require("./Identifier"),
    uuid = require("node-uuid"),
    DatabankObject = databank.DatabankObject;

var Person = DatabankObject.subClass("person");

Person.schema = {pkey: "uuid",
                 fields: [],
                 indices: []
                };

Person.beforeCreate = function(props, callback) {
    if (!props.uuid) {
        props.uuid = uuid.v4();
    }
    callback(null, props);
};

Person.fromIdentifier = function(id, callback) {
    Identifier.get(id, function(err, identifier) {
        if (err) {
            callback(err, null);
        } else {
            Person.get(identifier.person, function(err, person) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, person);
                }
            });
        }
    });
};

Person.prototype.getIdentifiers = function(callback) {
    var person = this;

    Identifier.search({uuid: person.uuid}, function(err, identifiers) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, identifiers);
        }
    });
};

exports.Person = Person;

