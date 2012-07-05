// Identifier class

var databank = require('databank'),
    DatabankObject = databank.DatabankObject;

var Identifier = DatabankObject.subClass("identifier");

Identifier.schema = {pkey: "id",
                     fields: ["person", "type", "created", "modified"],
                     indices: ["person"]
                    };
Identifier.beforeCreate = function(props, callback) {
    // Timestamp
    props.modified = props.created = Date.now();
    callback(null, props);
};

Identifier.beforeUpdate = function(props, callback) {
    // Can't overwrite these properties
    if (props.id) {
        delete props.id;
    }
    if (props.created) {
        delete props.created;
    }
    // Timestamp
    props.modified = Date.now();
    callback(null, props);
};

Identifier.beforeSave = function(callback) {
    this.modified = Date.now();
    callback(null);
};

module.exports = Identifier;


