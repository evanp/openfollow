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
        if (err) return callback(err, null);
        Person.get(identifier.person, callback);
    });
};

Person.prototype.getIdentifiers = function(callback) {
    var person = this;

    Identifier.search({person: person.uuid}, function(err, ids) {
        var strings;
        if (err) {
            callback(err);
        } else {
            strings = ids.map(function(obj) { return obj.id; });
            callback(null, strings);
        }
    });
};

module.exports = Person;