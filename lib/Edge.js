// Edge class

var databank = require("databank"),
    Identifier = require("./Identifier"),
    DatabankObject = databank.DatabankObject;

var Edge = DatabankObject.subClass("edge");

Edge.schema = {pkey: "fromto",
               fields: ["from", "to", "source", "created", "modified"],
               indices: ["from", "to"]
              };

Edge.beforeCreate = function(props, callback) {

    if (!props.from || !props.to) {
        callback(new Error("Need 'from' and 'to'"), null);
        return;
    }

    props.fromto = Edge.makeFromTo(props.from, props.to);
    props.created = props.modified = Date.now();
    callback(null, props);
};

module.exports = Edge;
