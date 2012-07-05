// Identifier class

var databank = require('databank'),
    DatabankObject = databank.DatabankObject;

var Identifier = DatabankObject.subClass("identifier");

Identifier.schema = {pkey: "id",
                     fields: ["person", "type"],
                     indices: []
                    };

module.exports = Identifier;


